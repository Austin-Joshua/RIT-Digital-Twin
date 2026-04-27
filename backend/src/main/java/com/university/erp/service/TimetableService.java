package com.university.erp.service;

import com.university.erp.dto.TimetableGenerateRequest;
import com.university.erp.dto.TimetableSlotFacultyUserViewDto;
import com.university.erp.dto.TimetableSlotFacultyViewDto;
import com.university.erp.dto.TimetableGeneratorAccessDto;
import com.university.erp.dto.TimetableGenerationResponseDto;
import com.university.erp.dto.TimetableMatrixEntryDto;
import com.university.erp.dto.TimetablePrintReadyReportDto;
import com.university.erp.dto.TimetableSlotSubjectViewDto;
import com.university.erp.dto.TimetableSlotViewDto;
import com.university.erp.dto.TimetableUnscheduledItemDto;
import com.university.erp.dto.TimetableValidationReportDto;
import com.university.erp.model.*;
import com.university.erp.repository.*;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TimetableService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final List<String> DEFAULT_DAYS = List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY");
    private static final List<String> DEFAULT_CSE_SECTIONS = List.of("CSE-A", "CSE-B", "CSE-C", "CSE-D", "CSE-E", "CSE-F", "CSE-G");
    private static final LocalTime WORK_DAY_START = LocalTime.of(8, 0);
    private static final LocalTime WORK_DAY_END = LocalTime.of(15, 0);
    private static final int FIXED_PERIOD_DURATION_MINUTES = 50;
    private static final int FIXED_PERIODS_PER_DAY = (int) ((WORK_DAY_END.toSecondOfDay() - WORK_DAY_START.toSecondOfDay()) / (FIXED_PERIOD_DURATION_MINUTES * 60L));
    private static final int DEFAULT_MAX_FACULTY_PERIODS_PER_DAY = 7;
    private static final int DEFAULT_MAX_CONSECUTIVE_PERIODS_PER_FACULTY = 6;
    private static final String APPROVAL_STATUS_APPROVED = "APPROVED";
    private static final Map<String, Integer> CURRICULUM_PERIODS_BY_CODE = buildCurriculumPeriodMap();

    private final TimetableSlotRepository timetableSlotRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultySubjectRepository facultySubjectRepository;
    private final TimetableSubjectRequirementRepository requirementRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    @Value("${app.timetable.generator-faculty-username:}")
    private String generatorFacultyUsername;

    public TimetableService(
            TimetableSlotRepository timetableSlotRepository,
            StudentRepository studentRepository,
            DepartmentRepository departmentRepository,
            FacultySubjectRepository facultySubjectRepository,
            TimetableSubjectRequirementRepository requirementRepository,
            UserRepository userRepository,
            SubjectRepository subjectRepository
    ) {
        this.timetableSlotRepository = timetableSlotRepository;
        this.studentRepository = studentRepository;
        this.departmentRepository = departmentRepository;
        this.facultySubjectRepository = facultySubjectRepository;
        this.requirementRepository = requirementRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "studentTimetable", key = "#userId")
    public List<TimetableSlot> getStudentTimetable(Long userId) {
        Student student = studentRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
        if (student.getDepartment() == null || student.getSection() == null || student.getSection().isBlank()) {
            return Collections.emptyList();
        }
        return timetableSlotRepository.findByDepartmentIdAndSection(student.getDepartment().getId(), student.getSection())
                .stream()
                .sorted(Comparator.comparing(TimetableSlot::getDayOfWeek).thenComparing(TimetableSlot::getStartTime))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TimetableSlotViewDto> getStudentTimetableView(Long userId) {
        return getStudentTimetable(userId).stream()
                .map(this::toResponseSafeSlot)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TimetableSlot> getFacultyTimetable(Long facultyUserId) {
        return timetableSlotRepository.findAll()
                .stream()
                .filter(slot -> slot.getFaculty() != null
                        && slot.getFaculty().getUserId() != null
                        && slot.getFaculty().getUserId().equals(facultyUserId))
                .sorted(Comparator.comparing(TimetableSlot::getDayOfWeek).thenComparing(TimetableSlot::getStartTime))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TimetableSlotViewDto> getFacultyTimetableView(Long facultyUserId) {
        return getFacultyTimetable(facultyUserId).stream()
                .map(this::toResponseSafeSlot)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TimetableSlot> getAdminTimetable(Long deptId, String section) {
        if (section == null || section.isBlank()) {
            return timetableSlotRepository.findByDepartmentId(deptId);
        }
        return timetableSlotRepository.findByDepartmentIdAndSection(deptId, section.trim());
    }

    @Transactional(readOnly = true)
    public List<TimetableSlotViewDto> getAdminTimetableView(Long deptId, String section) {
        return getAdminTimetable(deptId, section).stream()
                .map(this::toResponseSafeSlot)
                .toList();
    }

    @Transactional(readOnly = true)
    public TimetablePrintReadyReportDto getPrintReadyTimetableReport(Long deptId, String section) {
        if (deptId == null) {
            throw new RuntimeException("Department is required");
        }
        List<TimetableSlot> slots = getAdminTimetable(deptId, section);
        List<TimetableSlot> sortedByClass = slots.stream()
                .sorted(Comparator.comparing(TimetableSlot::getSection, Comparator.nullsLast(String::compareTo))
                        .thenComparing(this::dayRank)
                        .thenComparing(TimetableSlot::getStartTime))
                .toList();

        Map<String, List<String>> classWise = new TreeMap<>();
        for (TimetableSlot slot : sortedByClass) {
            String sectionKey = normalizeSection(slot.getSection());
            classWise.computeIfAbsent(sectionKey, key -> new ArrayList<>())
                    .add(formatPrintLine(slot, false));
        }

        List<TimetableSlot> sortedByFaculty = slots.stream()
                .sorted(Comparator.comparing((TimetableSlot slot) -> facultyLabel(slot.getFaculty()))
                        .thenComparing(this::dayRank)
                        .thenComparing(TimetableSlot::getStartTime)
                        .thenComparing(TimetableSlot::getSection, Comparator.nullsLast(String::compareTo)))
                .toList();
        Map<String, List<String>> facultyWise = new TreeMap<>();
        for (TimetableSlot slot : sortedByFaculty) {
            String facultyKey = facultyLabel(slot.getFaculty());
            facultyWise.computeIfAbsent(facultyKey, key -> new ArrayList<>())
                    .add(formatPrintLine(slot, true));
        }

        return TimetablePrintReadyReportDto.builder()
                .departmentId(deptId)
                .sectionScope(section == null || section.isBlank() ? "ALL" : normalizeSection(section))
                .displayFormat("Day -> Period -> Subject -> Faculty")
                .classWiseReport(classWise)
                .facultyWiseReport(facultyWise)
                .build();
    }

    @Transactional
    public byte[] exportTimetablePdf(TimetableGenerateRequest request, User currentUser) {
        Long departmentId = resolveDepartmentIdForGeneration(currentUser, request != null ? request.getDeptId() : null);
        if (departmentId == null) {
            throw new RuntimeException("Department is required for PDF export.");
        }
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        TimetableGenerateRequest effectiveRequest = request == null ? new TimetableGenerateRequest() : request;
        effectiveRequest.setDeptId(departmentId);
        List<String> targetSections = resolveSections(effectiveRequest, department);
        List<TimetableSlot> slots = timetableSlotRepository.findByDepartmentIdAndSectionIn(departmentId, targetSections);
        if (slots.isEmpty()) {
            // Auto-recover to keep export path reliable.
            TimetableGenerateRequest autoGenerate = new TimetableGenerateRequest();
            autoGenerate.setDeptId(departmentId);
            autoGenerate.setSections(targetSections);
            autoGenerate.setSemesterNumber(effectiveRequest.getSemesterNumber());
            autoGenerate.setDaysPerWeek(effectiveRequest.getDaysPerWeek());
            autoGenerate.setPeriodsPerDay(effectiveRequest.getPeriodsPerDay());
            autoGenerate.setPeriodDurationMinutes(effectiveRequest.getPeriodDurationMinutes());
            autoGenerate.setStrictMode(false);
            generateWeeklyTimetable(autoGenerate, currentUser);
            slots = timetableSlotRepository.findByDepartmentIdAndSectionIn(departmentId, targetSections);
        }
        try {
            return buildDepartmentPdf(department, slots, targetSections, effectiveRequest.getSemesterNumber());
        } catch (Exception ex) {
            return buildFallbackPdf(department, targetSections, effectiveRequest.getSemesterNumber(), ex.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public TimetableGeneratorAccessDto getTimetableGeneratorAccess(User currentUser, Integer semesterNumber) {
        boolean canGenerate = canCurrentUserGenerateTimetable(currentUser);
        String configured = normalizeConfiguredGeneratorUsername();
        Long allowedDeptId = resolveDepartmentIdForGeneration(currentUser, null);
        String deptCode = null;
        try {
            if (allowedDeptId != null) {
                deptCode = departmentRepository.findById(allowedDeptId).map(Department::getCode).orElse(null);
            }
        } catch (Exception ignored) {
            deptCode = null;
        }
        List<String> sections = getAvailableSectionsForGeneration(currentUser, semesterNumber);
        String message = canGenerate
                ? "You are authorized to generate timetable allocation."
                : (configured.isEmpty()
                    ? "Generator faculty is not configured. Any faculty with approved allocations can generate timetable."
                    : "Only configured faculty '" + configured + "' can generate timetable allocation.");
        return TimetableGeneratorAccessDto.builder()
                .canGenerate(canGenerate)
                .configuredFacultyUsername(configured.isEmpty() ? null : configured)
                .message(message)
                .allowedDepartmentId(allowedDeptId)
                .allowedDepartmentCode(deptCode)
                .availableSections(sections)
                .supportedModes(List.of("STRICT", "BEST_EFFORT"))
                .build();
    }

    @Transactional
    @CacheEvict(cacheNames = "studentTimetable", allEntries = true)
    public TimetableGenerationResponseDto generateWeeklyTimetable(TimetableGenerateRequest request, User currentUser) {
        if (!canCurrentUserGenerateTimetable(currentUser)) {
            throw new RuntimeException("You are not allowed to generate timetable. Only the configured faculty can perform this action.");
        }
        if (request == null) {
            throw new RuntimeException("Generation request is required");
        }
        Long departmentId = resolveDepartmentIdForGeneration(currentUser, request.getDeptId());
        if (departmentId == null) {
            throw new RuntimeException("Department is required");
        }
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        int periodsPerDay = clamp(request.getPeriodsPerDay(), 4, 10, FIXED_PERIODS_PER_DAY);
        int periodDurationMinutes = clamp(request.getPeriodDurationMinutes(), 40, 60, FIXED_PERIOD_DURATION_MINUTES);
        boolean strictMode = request.getStrictMode() == null || request.getStrictMode();
        int semesterNumber = request.getSemesterNumber() == null ? 0 : request.getSemesterNumber();
        List<String> days = DEFAULT_DAYS.subList(0, clamp(request.getDaysPerWeek(), 1, DEFAULT_DAYS.size(), DEFAULT_DAYS.size()));

        List<String> sections = resolveSections(request, dept);
        if (sections.isEmpty()) {
            throw new RuntimeException("No target sections found for timetable generation.");
        }

        List<FacultySubject> allApprovedAllocations = facultySubjectRepository.findBySubject_Department_Id(dept.getId()).stream()
                .filter(this::isApprovedAllocation)
                .toList();
        List<FacultySubject> allocations = allApprovedAllocations.stream()
                .filter(fs -> fs.getSection() != null && sections.contains(normalizeSection(fs.getSection())))
                .filter(fs -> semesterNumber == 0 || (fs.getSemester() != null && semesterNumber == fs.getSemester().getSemesterNumber()))
                .toList();

        if (allocations.isEmpty()) {
            // Fallback 1: relax semester filter for operational continuity.
            allocations = allApprovedAllocations.stream()
                    .filter(fs -> fs.getSection() != null && sections.contains(normalizeSection(fs.getSection())))
                    .toList();
        }
        if (allocations.isEmpty()) {
            // Fallback 2: relax section filter to keep generation available for manual refinement.
            allocations = allApprovedAllocations;
        }
        List<RequirementUnit> requirementUnits = buildRequirementUnits(dept, sections, allocations, semesterNumber);
        List<RequirementUnit> fallbackUnits = buildRequirementUnitsFromCurriculumFallback(dept, sections, semesterNumber, currentUser, allocations);
        requirementUnits = mergeRequirementUnits(requirementUnits, fallbackUnits);
        List<User> operationalFacultyPool = buildOperationalFacultyPool(dept, allocations, currentUser);
        int minimumHealthyDemand = sections.size() * Math.max(4, periodsPerDay);
        int mergedDemand = requirementUnits.stream().mapToInt(RequirementUnit::requiredPeriods).sum();
        if (mergedDemand < minimumHealthyDemand && !fallbackUnits.isEmpty()) {
            // Sparse allocation mapping found; prefer curriculum-backed demand for full department generation.
            requirementUnits = fallbackUnits;
        }
        if (requirementUnits.isEmpty()) {
            if (strictMode) {
                throw new RuntimeException("No HOD-approved faculty-subject allocation found for selected scope.");
            }
            List<SlotKey> slotKeys = buildSlotKeys(days, periodsPerDay, periodDurationMinutes);
            TimetableMatrices emptyMatrices = buildTimetableMatrices(Collections.emptyMap(), slotKeys, sections);
            TimetableValidationReportDto emptyReport = TimetableValidationReportDto.builder()
                    .facultyClashFree(true)
                    .classClashFree(true)
                    .noSubjectOverlap(true)
                    .crossClassConflictFree(true)
                    .allSubjectsScheduled(false)
                    .allRequiredHoursSatisfied(false)
                    .fullyFilled(false)
                    .allSlotsValid(true)
                    .totalDemandPeriods(0)
                    .scheduledPeriods(0)
                    .unscheduledPeriods(0)
                    .facultyClashCount(0)
                    .classClashCount(0)
                    .dailyLoadBySection(Collections.emptyMap())
                    .unscheduledItems(Collections.emptyList())
                    .build();
            return TimetableGenerationResponseDto.builder()
                    .success(true)
                    .message("No approved allocations found. Generated blank timetable shell for manual assignment.")
                    .slots(Collections.emptyList())
                    .validation(emptyReport)
                    .classWiseTimetable(emptyMatrices.classWise())
                    .facultyWiseTimetable(emptyMatrices.facultyWise())
                    .build();
        }
        int totalDemand = requirementUnits.stream().mapToInt(RequirementUnit::requiredPeriods).sum();

        List<SlotKey> slotKeys = buildSlotKeys(days, periodsPerDay, periodDurationMinutes);
        Map<SlotKey, List<Assignment>> assignmentsBySlot = new LinkedHashMap<>();
        Map<String, Set<SlotKey>> sectionOccupied = new HashMap<>();
        Map<Long, Set<SlotKey>> facultyOccupied = new HashMap<>();
        Map<String, Map<Long, Integer>> sectionDailySubjectCount = new HashMap<>();
        Map<Long, Map<String, Integer>> facultyDailyLoad = new HashMap<>();
        Map<RequirementUnit, Integer> scheduledCount = new LinkedHashMap<>();
        List<TimetableUnscheduledItemDto> unscheduledItems = new ArrayList<>();

        requirementUnits.sort(Comparator.comparingInt(RequirementUnit::requiredPeriods).reversed());
        for (RequirementUnit unit : requirementUnits) {
            if (isLabOrActivity(unit.subject())) {
                int pairedTarget = unit.requiredPeriods() / 2;
                for (int i = 0; i < pairedTarget; i++) {
                    SlotPair pair = pickBestConsecutiveSlotPair(
                            unit,
                            slotKeys,
                            sectionOccupied,
                            facultyOccupied,
                            sectionDailySubjectCount,
                            facultyDailyLoad,
                            DEFAULT_MAX_FACULTY_PERIODS_PER_DAY,
                            DEFAULT_MAX_CONSECUTIVE_PERIODS_PER_FACULTY
                    );
                    if (pair == null) {
                        break;
                    }
                    Assignment a1 = new Assignment(unit.section(), unit.subject(), unit.facultyUser(), pair.first());
                    Assignment a2 = new Assignment(unit.section(), unit.subject(), unit.facultyUser(), pair.second());
                    placeAssignment(unit, a1, assignmentsBySlot, sectionOccupied, facultyOccupied, sectionDailySubjectCount, facultyDailyLoad);
                    placeAssignment(unit, a2, assignmentsBySlot, sectionOccupied, facultyOccupied, sectionDailySubjectCount, facultyDailyLoad);
                    doneByUnit(scheduledCount, unit, 2);
                }
            }
            int done = 0;
            if (scheduledCount.containsKey(unit)) {
                done = scheduledCount.get(unit);
            }
            for (int i = 0; i < unit.requiredPeriods(); i++) {
                if (done >= unit.requiredPeriods()) {
                    break;
                }
                SlotKey picked = pickBestSlot(
                        unit,
                        slotKeys,
                        sectionOccupied,
                        facultyOccupied,
                        sectionDailySubjectCount,
                        facultyDailyLoad,
                        DEFAULT_MAX_FACULTY_PERIODS_PER_DAY,
                        DEFAULT_MAX_CONSECUTIVE_PERIODS_PER_FACULTY
                );
                if (picked == null) {
                    break;
                }
                Assignment assignment = new Assignment(unit.section(), unit.subject(), unit.facultyUser(), picked);
                placeAssignment(unit, assignment, assignmentsBySlot, sectionOccupied, facultyOccupied, sectionDailySubjectCount, facultyDailyLoad);
                done++;
            }
            scheduledCount.put(unit, done);
            if (!strictMode && done < unit.requiredPeriods() && !operationalFacultyPool.isEmpty()) {
                int remaining = unit.requiredPeriods() - done;
                for (int r = 0; r < remaining; r++) {
                    FallbackAssignment fallbackAssignment = pickFallbackAssignment(
                            unit,
                            operationalFacultyPool,
                            slotKeys,
                            sectionOccupied,
                            facultyOccupied,
                            sectionDailySubjectCount,
                            facultyDailyLoad,
                            periodsPerDay
                    );
                    if (fallbackAssignment == null) {
                        break;
                    }
                    placeAssignment(
                            fallbackAssignment.unit(),
                            fallbackAssignment.assignment(),
                            assignmentsBySlot,
                            sectionOccupied,
                            facultyOccupied,
                            sectionDailySubjectCount,
                            facultyDailyLoad
                    );
                    doneByUnit(scheduledCount, unit, 1);
                    done++;
                }
            }
        }
        unscheduledItems = buildUnscheduledItems(requirementUnits, scheduledCount);

        if (strictMode && !unscheduledItems.isEmpty()) {
            TimetableValidationReportDto report = buildValidationReport(totalDemand, scheduledCount, unscheduledItems, assignmentsBySlot, slotKeys, sections);
            return TimetableGenerationResponseDto.builder()
                    .success(false)
                    .message("Timetable generation failed in strict mode due to unscheduled requirements.")
                    .slots(Collections.emptyList())
                    .validation(report)
                    .classWiseTimetable(Collections.emptyMap())
                    .facultyWiseTimetable(Collections.emptyMap())
                    .build();
        }

        timetableSlotRepository.deleteByDepartmentIdAndSectionIn(dept.getId(), sections);

        List<TimetableSlot> saved = new ArrayList<>();
        for (Map.Entry<SlotKey, List<Assignment>> entry : assignmentsBySlot.entrySet()) {
            for (Assignment assignment : entry.getValue()) {
                TimetableSlot slot = TimetableSlot.builder()
                        .dayOfWeek(entry.getKey().day())
                        .startTime(entry.getKey().startTime())
                        .endTime(entry.getKey().endTime())
                        .subject(assignment.subject())
                        .faculty(assignment.faculty())
                        .section(assignment.section())
                        .department(dept)
                        .build();
                saved.add(slot);
            }
        }
        saved = timetableSlotRepository.saveAll(saved);
        List<TimetableSlot> persistedSlots = timetableSlotRepository.findByDepartmentIdAndSectionIn(dept.getId(), sections);

        TimetableValidationReportDto report = buildValidationReport(totalDemand, scheduledCount, unscheduledItems, assignmentsBySlot, slotKeys, sections);
        TimetableMatrices matrices = buildTimetableMatrices(assignmentsBySlot, slotKeys, sections);
        return TimetableGenerationResponseDto.builder()
                .success(unscheduledItems.isEmpty())
                .message(unscheduledItems.isEmpty()
                        ? "Timetable generated successfully."
                        : "Timetable generated with unresolved requirements.")
                .slots(persistedSlots.stream()
                        .sorted(Comparator.comparing(TimetableSlot::getSection)
                                .thenComparing(TimetableSlot::getDayOfWeek)
                                .thenComparing(TimetableSlot::getStartTime))
                        .map(this::toResponseSafeSlot)
                        .toList())
                .validation(report)
                .classWiseTimetable(matrices.classWise())
                .facultyWiseTimetable(matrices.facultyWise())
                .build();
    }

    private List<RequirementUnit> mergeRequirementUnits(List<RequirementUnit> primary, List<RequirementUnit> fallback) {
        if ((primary == null || primary.isEmpty()) && (fallback == null || fallback.isEmpty())) {
            return Collections.emptyList();
        }
        Map<String, RequirementUnit> merged = new LinkedHashMap<>();
        if (primary != null) {
            for (RequirementUnit unit : primary) {
                if (unit == null || unit.subject() == null) continue;
                merged.put(unit.section() + "|" + unit.subject().getId(), unit);
            }
        }
        if (fallback != null) {
            for (RequirementUnit unit : fallback) {
                if (unit == null || unit.subject() == null) continue;
                merged.putIfAbsent(unit.section() + "|" + unit.subject().getId(), unit);
            }
        }
        return new ArrayList<>(merged.values());
    }

    private List<User> buildOperationalFacultyPool(Department department, List<FacultySubject> allocations, User currentUser) {
        LinkedHashMap<Long, User> pool = new LinkedHashMap<>();
        userRepository.findByRole_RoleNameAndDepartment_Id(Role.UserRole.FACULTY, department.getId()).stream()
                .filter(user -> "active".equalsIgnoreCase(user.getAccountStatus()) || user.getAccountStatus() == null)
                .forEach(user -> pool.put(user.getUserId(), user));
        if (allocations != null) {
            allocations.stream()
                    .map(FacultySubject::getFaculty)
                    .filter(Objects::nonNull)
                    .map(FacultyProfile::getUser)
                    .filter(Objects::nonNull)
                    .filter(user -> "active".equalsIgnoreCase(user.getAccountStatus()) || user.getAccountStatus() == null)
                    .forEach(user -> pool.put(user.getUserId(), user));
        }
        if (pool.isEmpty() && currentUser != null) {
            pool.put(currentUser.getUserId(), currentUser);
        }
        return new ArrayList<>(pool.values());
    }

    private FallbackAssignment pickFallbackAssignment(
            RequirementUnit originalUnit,
            List<User> facultyPool,
            List<SlotKey> allKeys,
            Map<String, Set<SlotKey>> sectionOccupied,
            Map<Long, Set<SlotKey>> facultyOccupied,
            Map<String, Map<Long, Integer>> sectionDailySubjectCount,
            Map<Long, Map<String, Integer>> facultyDailyLoad,
            int relaxedDailyLimit
    ) {
        Set<SlotKey> classBusy = sectionOccupied.getOrDefault(originalUnit.section(), Collections.emptySet());
        int bestScore = Integer.MIN_VALUE;
        FallbackAssignment best = null;
        for (SlotKey key : allKeys) {
            if (classBusy.contains(key)) continue;
            int dayRepeat = sectionDailySubjectCount
                    .getOrDefault(originalUnit.section(), Collections.emptyMap())
                    .getOrDefault(dailySubjectKey(key.day(), originalUnit.subject().getId()), 0);
            for (User faculty : facultyPool) {
                Set<SlotKey> facultyBusy = facultyOccupied.getOrDefault(faculty.getUserId(), Collections.emptySet());
                if (facultyBusy.contains(key)) continue;
                RequirementUnit candidateUnit = new RequirementUnit(originalUnit.section(), originalUnit.subject(), faculty, 1);
                if (!underFacultyLoadLimits(candidateUnit, key, facultyDailyLoad, facultyBusy, relaxedDailyLimit, relaxedDailyLimit)) {
                    continue;
                }
                int score = 120 - (dayRepeat * 20) - key.periodIndex();
                if (score > bestScore) {
                    bestScore = score;
                    best = new FallbackAssignment(
                            candidateUnit,
                            new Assignment(originalUnit.section(), originalUnit.subject(), faculty, key)
                    );
                }
            }
        }
        return best;
    }

    private List<TimetableUnscheduledItemDto> buildUnscheduledItems(
            List<RequirementUnit> requirementUnits,
            Map<RequirementUnit, Integer> scheduledCount
    ) {
        List<TimetableUnscheduledItemDto> unscheduled = new ArrayList<>();
        for (RequirementUnit unit : requirementUnits) {
            int done = scheduledCount.getOrDefault(unit, 0);
            if (done >= unit.requiredPeriods()) continue;
            unscheduled.add(TimetableUnscheduledItemDto.builder()
                    .section(unit.section())
                    .subjectId(unit.subject().getId())
                    .subjectCode(unit.subject().getSubjectCode())
                    .subjectName(unit.subject().getSubjectName())
                    .facultyName(facultyLabel(unit.facultyUser()))
                    .requiredPeriods(unit.requiredPeriods())
                    .scheduledPeriods(done)
                    .reason("No conflict-free slot available")
                    .build());
        }
        return unscheduled;
    }

    private TimetableSlotViewDto toResponseSafeSlot(TimetableSlot slot) {
        return TimetableSlotViewDto.builder()
                .id(slot.getId())
                .dayOfWeek(slot.getDayOfWeek())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .section(slot.getSection())
                .subject(toResponseSafeSubject(slot.getSubject()))
                .faculty(toResponseSafeFaculty(slot.getFaculty()))
                .build();
    }

    private TimetableSlotSubjectViewDto toResponseSafeSubject(Subject subject) {
        if (subject == null) return null;
        return TimetableSlotSubjectViewDto.builder()
                .id(subject.getId())
                .subjectCode(subject.getSubjectCode())
                .subjectName(subject.getSubjectName())
                .credits(subject.getCredits())
                .regulation(subject.getRegulation())
                .build();
    }

    private TimetableSlotFacultyViewDto toResponseSafeFaculty(User faculty) {
        if (faculty == null) return null;
        return TimetableSlotFacultyViewDto.builder()
                .user(TimetableSlotFacultyUserViewDto.builder()
                        .userId(faculty.getUserId())
                        .username(faculty.getUsername())
                        .firstName(faculty.getFirstName())
                        .lastName(faculty.getLastName())
                        .email(faculty.getEmail())
                        .build())
                .build();
    }

    private void doneByUnit(Map<RequirementUnit, Integer> scheduledCount, RequirementUnit unit, int delta) {
        scheduledCount.merge(unit, delta, Integer::sum);
    }

    private void placeAssignment(
            RequirementUnit unit,
            Assignment assignment,
            Map<SlotKey, List<Assignment>> assignmentsBySlot,
            Map<String, Set<SlotKey>> sectionOccupied,
            Map<Long, Set<SlotKey>> facultyOccupied,
            Map<String, Map<Long, Integer>> sectionDailySubjectCount,
            Map<Long, Map<String, Integer>> facultyDailyLoad
    ) {
        SlotKey slot = assignment.slotKey();
        assignmentsBySlot.computeIfAbsent(slot, key -> new ArrayList<>()).add(assignment);
        sectionOccupied.computeIfAbsent(unit.section(), key -> new HashSet<>()).add(slot);
        facultyOccupied.computeIfAbsent(unit.facultyUser().getUserId(), key -> new HashSet<>()).add(slot);
        sectionDailySubjectCount
                .computeIfAbsent(unit.section(), key -> new HashMap<>())
                .merge(dailySubjectKey(slot.day(), unit.subject().getId()), 1, Integer::sum);
        facultyDailyLoad
                .computeIfAbsent(unit.facultyUser().getUserId(), key -> new HashMap<>())
                .merge(slot.day(), 1, Integer::sum);
    }

    private List<RequirementUnit> buildRequirementUnits(
            Department department,
            List<String> sections,
            List<FacultySubject> allocations,
            Integer semesterNumber
    ) {
        List<RequirementUnit> units = new ArrayList<>();
        Map<String, List<TimetableSubjectRequirement>> requirementsBySection = new HashMap<>();
        for (String section : sections) {
            List<TimetableSubjectRequirement> requirements = (semesterNumber != null && semesterNumber > 0)
                    ? requirementRepository.findByDepartment_IdAndSectionIgnoreCaseAndSemester_SemesterNumber(
                            department.getId(), section, semesterNumber)
                    : requirementRepository.findByDepartment_IdAndSectionIgnoreCase(department.getId(), section);
            requirementsBySection.put(section, requirements);
        }

        for (FacultySubject fs : allocations) {
            String section = normalizeSection(fs.getSection());
            if (!sections.contains(section)) {
                continue;
            }

            int periods = resolveWeeklyPeriods(requirementsBySection.getOrDefault(section, Collections.emptyList()), fs, semesterNumber);
            if (periods <= 0 || fs.getFaculty() == null || fs.getFaculty().getUser() == null) {
                continue;
            }
            units.add(new RequirementUnit(section, fs.getSubject(), fs.getFaculty().getUser(), periods));
        }
        return units;
    }

    private int resolveWeeklyPeriods(List<TimetableSubjectRequirement> requirements, FacultySubject fs, Integer semesterNumber) {
        for (TimetableSubjectRequirement req : requirements) {
            if (req.getSubject() != null && fs.getSubject() != null
                    && Objects.equals(req.getSubject().getId(), fs.getSubject().getId())) {
                return req.getPeriodsPerWeek() == null ? 0 : req.getPeriodsPerWeek();
            }
        }
        return fallbackPeriodsFromSubject(fs.getSubject());
    }

    private List<RequirementUnit> buildRequirementUnitsFromCurriculumFallback(
            Department department,
            List<String> sections,
            Integer semesterNumber,
            User currentUser,
            List<FacultySubject> candidateAllocations
    ) {
        List<User> facultyPool = userRepository.findByRole_RoleNameAndDepartment_Id(Role.UserRole.FACULTY, department.getId())
                .stream()
                .filter(user -> "active".equalsIgnoreCase(user.getAccountStatus()) || user.getAccountStatus() == null)
                .toList();
        if (candidateAllocations != null && !candidateAllocations.isEmpty()) {
            List<User> allocationUsers = candidateAllocations.stream()
                    .map(FacultySubject::getFaculty)
                    .filter(Objects::nonNull)
                    .map(FacultyProfile::getUser)
                    .filter(Objects::nonNull)
                    .filter(user -> "active".equalsIgnoreCase(user.getAccountStatus()) || user.getAccountStatus() == null)
                    .toList();
            if (!allocationUsers.isEmpty()) {
                LinkedHashMap<Long, User> dedup = new LinkedHashMap<>();
                for (User user : facultyPool) dedup.put(user.getUserId(), user);
                for (User user : allocationUsers) dedup.put(user.getUserId(), user);
                facultyPool = new ArrayList<>(dedup.values());
            }
        }
        if (facultyPool.isEmpty() && currentUser != null) {
            facultyPool = List.of(currentUser);
        }
        if (facultyPool.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, List<TimetableSubjectRequirement>> requirementsBySection = new HashMap<>();
        for (String section : sections) {
            List<TimetableSubjectRequirement> reqs = (semesterNumber != null && semesterNumber > 0)
                    ? requirementRepository.findByDepartment_IdAndSectionIgnoreCaseAndSemester_SemesterNumber(
                            department.getId(), section, semesterNumber)
                    : requirementRepository.findByDepartment_IdAndSectionIgnoreCase(department.getId(), section);
            requirementsBySection.put(section, reqs);
        }

        List<Subject> subjectCatalog = (semesterNumber != null && semesterNumber > 0)
                ? subjectRepository.findBySemester_SemesterNumberAndDepartmentNameIgnoreCaseOrderBySubjectCodeAsc(
                        semesterNumber, department.getDeptName())
                : subjectRepository.findByDepartmentId(department.getId());
        if (subjectCatalog.isEmpty()) {
            subjectCatalog = subjectRepository.findByDepartmentId(department.getId());
        }
        if (subjectCatalog.isEmpty()) {
            return Collections.emptyList();
        }

        List<RequirementUnit> units = new ArrayList<>();
        int facultyCursor = 0;
        for (String section : sections) {
            List<TimetableSubjectRequirement> sectionReqs = requirementsBySection.getOrDefault(section, Collections.emptyList());
            if (!sectionReqs.isEmpty()) {
                for (TimetableSubjectRequirement req : sectionReqs) {
                    if (req.getSubject() == null) continue;
                    int periods = req.getPeriodsPerWeek() == null ? 0 : req.getPeriodsPerWeek();
                    if (periods <= 0) {
                        periods = fallbackPeriodsFromSubject(req.getSubject());
                    }
                    if (periods <= 0) continue;
                    User faculty = facultyPool.get(facultyCursor % facultyPool.size());
                    facultyCursor++;
                    units.add(new RequirementUnit(section, req.getSubject(), faculty, periods));
                }
                continue;
            }

            // Semester/section mapping missing: build robust fallback from subject catalog.
            for (Subject subject : subjectCatalog) {
                if (semesterNumber != null && semesterNumber > 0
                        && subject.getSemester() != null
                        && !semesterNumber.equals(subject.getSemester().getSemesterNumber())) {
                    continue;
                }
                int periods = fallbackPeriodsFromSubject(subject);
                if (periods <= 0) continue;
                User faculty = facultyPool.get(facultyCursor % facultyPool.size());
                facultyCursor++;
                units.add(new RequirementUnit(section, subject, faculty, periods));
            }
        }
        return units;
    }

    private int fallbackPeriodsFromSubject(Subject subject) {
        String code = subject.getSubjectCode() == null ? "" : subject.getSubjectCode().toUpperCase();
        String name = subject.getSubjectName() == null ? "" : subject.getSubjectName().toLowerCase();
        Integer curriculumMapped = CURRICULUM_PERIODS_BY_CODE.get(code);
        if (curriculumMapped != null) return curriculumMapped;

        if (subject.getSemester() != null && (subject.getSemester().getSemesterNumber() == 1 || subject.getSemester().getSemesterNumber() == 2)) {
            if (name.contains("english") || name.contains("communication")) return 3;
            if (name.contains("math") || name.contains("calculus") || name.contains("statistics")) return 4;
        }
        if (code.contains("LAB") || name.contains("lab")) return 2;
        if (name.contains("project")) return 2;
        if (name.contains("math")) return 4;
        if (name.contains("english") || name.contains("communication")) return 3;
        return 4;
    }

    private SlotKey pickBestSlot(
            RequirementUnit unit,
            List<SlotKey> allKeys,
            Map<String, Set<SlotKey>> sectionOccupied,
            Map<Long, Set<SlotKey>> facultyOccupied,
            Map<String, Map<Long, Integer>> sectionDailySubjectCount,
            Map<Long, Map<String, Integer>> facultyDailyLoad,
            int maxFacultyDailyPeriods,
            int maxConsecutivePeriods
    ) {
        SlotKey best = null;
        int bestScore = Integer.MIN_VALUE;
        Set<SlotKey> classBusy = sectionOccupied.getOrDefault(unit.section(), Collections.emptySet());
        Set<SlotKey> facultyBusy = facultyOccupied.getOrDefault(unit.facultyUser().getUserId(), Collections.emptySet());

        for (SlotKey key : allKeys) {
            if (classBusy.contains(key) || facultyBusy.contains(key)) continue;
            if (!underFacultyLoadLimits(unit, key, facultyDailyLoad, facultyBusy, maxFacultyDailyPeriods, maxConsecutivePeriods)) continue;

            int dayRepeat = sectionDailySubjectCount
                    .getOrDefault(unit.section(), Collections.emptyMap())
                    .getOrDefault(dailySubjectKey(key.day(), unit.subject().getId()), 0);
            int score = 100 - (dayRepeat * 35) - key.periodIndex();

            if (dayRepeat > 0) score -= 20;
            if (key.periodIndex() <= 1 && isLab(unit.subject())) score -= 10;
            if (key.periodIndex() >= 4 && !isLab(unit.subject())) score -= 5;

            if (score > bestScore) {
                bestScore = score;
                best = key;
            }
        }
        return best;
    }

    private SlotPair pickBestConsecutiveSlotPair(
            RequirementUnit unit,
            List<SlotKey> allKeys,
            Map<String, Set<SlotKey>> sectionOccupied,
            Map<Long, Set<SlotKey>> facultyOccupied,
            Map<String, Map<Long, Integer>> sectionDailySubjectCount,
            Map<Long, Map<String, Integer>> facultyDailyLoad,
            int maxFacultyDailyPeriods,
            int maxConsecutivePeriods
    ) {
        SlotPair best = null;
        int bestScore = Integer.MIN_VALUE;
        for (SlotKey first : allKeys) {
            SlotKey second = allKeys.stream()
                    .filter(candidate -> candidate.day().equals(first.day()) && candidate.periodIndex() == first.periodIndex() + 1)
                    .findFirst()
                    .orElse(null);
            if (second == null) continue;
            if (!isSlotAvailable(unit, first, sectionOccupied, facultyOccupied)
                    || !isSlotAvailable(unit, second, sectionOccupied, facultyOccupied)) continue;
            if (!underFacultyLoadLimits(unit, first, facultyDailyLoad, facultyOccupied.getOrDefault(unit.facultyUser().getUserId(), Collections.emptySet()), maxFacultyDailyPeriods, maxConsecutivePeriods)) continue;
            if (!underFacultyLoadLimits(unit, second, facultyDailyLoad, facultyOccupied.getOrDefault(unit.facultyUser().getUserId(), Collections.emptySet()), maxFacultyDailyPeriods, maxConsecutivePeriods)) continue;

            int dayRepeat = sectionDailySubjectCount
                    .getOrDefault(unit.section(), Collections.emptyMap())
                    .getOrDefault(dailySubjectKey(first.day(), unit.subject().getId()), 0);
            int score = 120 - (dayRepeat * 30) - first.periodIndex();
            if (first.periodIndex() >= 5) score -= 10;
            if (score > bestScore) {
                bestScore = score;
                best = new SlotPair(first, second);
            }
        }
        return best;
    }

    private boolean isSlotAvailable(
            RequirementUnit unit,
            SlotKey key,
            Map<String, Set<SlotKey>> sectionOccupied,
            Map<Long, Set<SlotKey>> facultyOccupied
    ) {
        Set<SlotKey> classBusy = sectionOccupied.getOrDefault(unit.section(), Collections.emptySet());
        Set<SlotKey> facultyBusy = facultyOccupied.getOrDefault(unit.facultyUser().getUserId(), Collections.emptySet());
        return !classBusy.contains(key) && !facultyBusy.contains(key);
    }

    private TimetableValidationReportDto buildValidationReport(
            int totalDemand,
            Map<RequirementUnit, Integer> scheduledCount,
            List<TimetableUnscheduledItemDto> unscheduledItems,
            Map<SlotKey, List<Assignment>> assignmentsBySlot,
            List<SlotKey> validKeys,
            List<String> sections
    ) {
        int scheduled = scheduledCount.values().stream().mapToInt(Integer::intValue).sum();
        int unscheduledPeriods = Math.max(totalDemand - scheduled, 0);

        int facultyClashes = 0;
        int classClashes = 0;

        for (List<Assignment> assignments : assignmentsBySlot.values()) {
            Set<Long> facultySet = new HashSet<>();
            Set<String> classSet = new HashSet<>();
            for (Assignment assignment : assignments) {
                if (!facultySet.add(assignment.faculty().getUserId())) {
                    facultyClashes++;
                }
                if (!classSet.add(assignment.section())) {
                    classClashes++;
                }
            }
        }

        Set<SlotKey> keySet = new HashSet<>(validKeys);
        boolean allSlotsValid = assignmentsBySlot.keySet().stream().allMatch(keySet::contains);
        boolean allRequiredHoursSatisfied = unscheduledItems.isEmpty()
                && scheduledCount.entrySet().stream().allMatch(entry -> Objects.equals(entry.getKey().requiredPeriods(), entry.getValue()));

        Map<String, Integer> dailyLoadBySection = new TreeMap<>();
        Map<String, Integer> sectionScheduledCounts = new HashMap<>();
        for (Map.Entry<SlotKey, List<Assignment>> entry : assignmentsBySlot.entrySet()) {
            for (Assignment assignment : entry.getValue()) {
                String key = assignment.section() + "-" + entry.getKey().day();
                dailyLoadBySection.merge(key, 1, Integer::sum);
                sectionScheduledCounts.merge(assignment.section(), 1, Integer::sum);
            }
        }
        boolean fullyFilled = sections.stream()
                .allMatch(section -> sectionScheduledCounts.getOrDefault(section, 0) >= validKeys.size());

        return TimetableValidationReportDto.builder()
                .facultyClashFree(facultyClashes == 0)
                .classClashFree(classClashes == 0)
                .noSubjectOverlap(facultyClashes == 0)
                .crossClassConflictFree(facultyClashes == 0)
                .allSubjectsScheduled(unscheduledItems.isEmpty())
                .allRequiredHoursSatisfied(allRequiredHoursSatisfied)
                .fullyFilled(fullyFilled)
                .allSlotsValid(allSlotsValid)
                .totalDemandPeriods(totalDemand)
                .scheduledPeriods(scheduled)
                .unscheduledPeriods(unscheduledPeriods)
                .facultyClashCount(facultyClashes)
                .classClashCount(classClashes)
                .dailyLoadBySection(dailyLoadBySection)
                .unscheduledItems(unscheduledItems)
                .build();
    }

    private TimetableMatrices buildTimetableMatrices(
            Map<SlotKey, List<Assignment>> assignmentsBySlot,
            List<SlotKey> slotKeys,
            List<String> sections
    ) {
        Map<String, Assignment> bySectionSlot = new HashMap<>();
        Map<String, Assignment> byFacultySlot = new HashMap<>();
        Set<User> facultyUsers = new HashSet<>();

        for (Map.Entry<SlotKey, List<Assignment>> entry : assignmentsBySlot.entrySet()) {
            SlotKey slot = entry.getKey();
            for (Assignment assignment : entry.getValue()) {
                bySectionSlot.put(assignment.section() + "|" + slot.day() + "|" + slot.periodIndex(), assignment);
                byFacultySlot.put(assignment.faculty().getUserId() + "|" + slot.day() + "|" + slot.periodIndex(), assignment);
                facultyUsers.add(assignment.faculty());
            }
        }

        Map<String, List<TimetableMatrixEntryDto>> classWise = new TreeMap<>();
        for (String section : sections) {
            List<TimetableMatrixEntryDto> entries = new ArrayList<>();
            for (SlotKey key : slotKeys) {
                Assignment assignment = bySectionSlot.get(section + "|" + key.day() + "|" + key.periodIndex());
                entries.add(buildMatrixEntry(key, section, assignment));
            }
            classWise.put(section, entries);
        }

        Map<String, List<TimetableMatrixEntryDto>> facultyWise = new TreeMap<>();
        for (User faculty : facultyUsers) {
            String facultyKey = facultyLabel(faculty);
            List<TimetableMatrixEntryDto> entries = new ArrayList<>();
            for (SlotKey key : slotKeys) {
                Assignment assignment = byFacultySlot.get(faculty.getUserId() + "|" + key.day() + "|" + key.periodIndex());
                entries.add(buildMatrixEntry(key, assignment != null ? assignment.section() : null, assignment));
            }
            facultyWise.put(facultyKey, entries);
        }

        return new TimetableMatrices(classWise, facultyWise);
    }

    private TimetableMatrixEntryDto buildMatrixEntry(SlotKey key, String section, Assignment assignment) {
        Subject subject = assignment == null ? null : assignment.subject();
        User faculty = assignment == null ? null : assignment.faculty();
        return TimetableMatrixEntryDto.builder()
                .day(key.day())
                .period(key.periodIndex() + 1)
                .startTime(key.startTime())
                .endTime(key.endTime())
                .section(section)
                .subjectCode(subject == null ? "FREE" : subject.getSubjectCode())
                .subjectName(subject == null ? "FREE PERIOD" : subject.getSubjectName())
                .facultyName(faculty == null ? "-" : facultyLabel(faculty))
                .freePeriod(subject == null)
                .build();
    }

    private List<SlotKey> buildSlotKeys(List<String> days, int periodsPerDay, int periodDurationMinutes) {
        List<SlotKey> keys = new ArrayList<>();
        LocalTime start = WORK_DAY_START;
        for (String day : days) {
            for (int period = 0; period < periodsPerDay; period++) {
                LocalTime periodStart = start.plusMinutes((long) period * periodDurationMinutes);
                LocalTime periodEnd = periodStart.plusMinutes(periodDurationMinutes);
                keys.add(new SlotKey(day, period, periodStart.format(TIME_FORMATTER), periodEnd.format(TIME_FORMATTER)));
            }
        }
        return keys;
    }

    private List<String> resolveSections(TimetableGenerateRequest request, Department department) {
        LinkedHashSet<String> sections = new LinkedHashSet<>();
        if (request.getSection() != null && !request.getSection().isBlank()) {
            sections.add(normalizeSection(request.getSection()));
        }
        if (request.getSections() != null) {
            request.getSections().forEach(section -> {
                if (section != null && !section.isBlank()) {
                    sections.add(normalizeSection(section));
                }
            });
        }
        if (sections.contains("ALL")) {
            sections.clear();
        }
        if (sections.isEmpty()) {
            sections.addAll(studentRepository.findDistinctSectionsByDepartmentId(department.getId()));
        }
        if (sections.isEmpty() && department.getCode() != null && "CSE".equalsIgnoreCase(department.getCode())) {
            sections.addAll(DEFAULT_CSE_SECTIONS);
        }
        return sections.stream().filter(section -> section != null && !section.isBlank()).toList();
    }

    @Transactional(readOnly = true)
    public List<String> getAvailableSectionsForGeneration(User currentUser, Integer semesterNumber) {
        Long departmentId = resolveDepartmentIdForGeneration(currentUser, null);
        if (departmentId == null) {
            return Collections.emptyList();
        }
        LinkedHashSet<String> sections = new LinkedHashSet<>();
        if (semesterNumber != null && semesterNumber > 0) {
            requirementRepository.findByDepartment_IdAndSemester_SemesterNumber(departmentId, semesterNumber)
                    .forEach(req -> sections.add(normalizeSection(req.getSection())));
            facultySubjectRepository.findBySubject_Department_Id(departmentId).stream()
                    .filter(this::isApprovedAllocation)
                    .filter(fs -> fs.getSemester() != null && semesterNumber.equals(fs.getSemester().getSemesterNumber()))
                    .forEach(fs -> sections.add(normalizeSection(fs.getSection())));
        } else {
            requirementRepository.findByDepartment_Id(departmentId)
                    .forEach(req -> sections.add(normalizeSection(req.getSection())));
            facultySubjectRepository.findBySubject_Department_Id(departmentId).stream()
                    .filter(this::isApprovedAllocation)
                    .forEach(fs -> sections.add(normalizeSection(fs.getSection())));
        }
        sections.addAll(studentRepository.findDistinctSectionsByDepartmentId(departmentId).stream()
                .map(this::normalizeSection)
                .toList());

        Department dept = departmentRepository.findById(departmentId).orElse(null);
        if ((dept != null && "CSE".equalsIgnoreCase(dept.getCode())) || sections.isEmpty()) {
            sections.addAll(DEFAULT_CSE_SECTIONS);
        }
        return sections.stream().filter(Objects::nonNull).filter(s -> !s.isBlank()).sorted().toList();
    }

    private Long resolveDepartmentIdForGeneration(User currentUser, Long requestedDeptId) {
        if (currentUser == null) return requestedDeptId;
        boolean admin = currentUser.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .anyMatch("ROLE_ADMIN"::equals);
        if (admin) {
            if (requestedDeptId != null) {
                return requestedDeptId;
            }
            if (currentUser.getDepartment() != null) {
                return currentUser.getDepartment().getId();
            }
            Department cse = departmentRepository.findByCode("CSE").orElse(null);
            if (cse != null) {
                return cse.getId();
            }
            return departmentRepository.findAll().stream().findFirst().map(Department::getId).orElse(null);
        }
        Long scopedDeptId = currentUser.getDepartment() != null ? currentUser.getDepartment().getId() : null;
        if (scopedDeptId == null) {
            return requestedDeptId;
        }
        return scopedDeptId;
    }

    private boolean underFacultyLoadLimits(
            RequirementUnit unit,
            SlotKey key,
            Map<Long, Map<String, Integer>> facultyDailyLoad,
            Set<SlotKey> facultyBusy,
            int maxFacultyDailyPeriods,
            int maxConsecutivePeriods
    ) {
        Map<String, Integer> dailyLoad = facultyDailyLoad.getOrDefault(unit.facultyUser().getUserId(), Collections.emptyMap());
        if (dailyLoad.getOrDefault(key.day(), 0) >= maxFacultyDailyPeriods) {
            return false;
        }
        int consecutiveBefore = 0;
        int left = key.periodIndex() - 1;
        while (left >= 0 && hasPeriodOccupied(facultyBusy, key.day(), left)) {
            consecutiveBefore++;
            left--;
        }
        int consecutiveAfter = 0;
        int right = key.periodIndex() + 1;
        while (hasPeriodOccupied(facultyBusy, key.day(), right)) {
            consecutiveAfter++;
            right++;
        }
        return (consecutiveBefore + 1 + consecutiveAfter) <= maxConsecutivePeriods;
    }

    private boolean hasPeriodOccupied(Set<SlotKey> occupied, String day, int periodIndex) {
        return occupied.stream().anyMatch(key -> key.day().equals(day) && key.periodIndex() == periodIndex);
    }

    private String normalizeSection(String section) {
        return section == null ? null : section.trim().toUpperCase();
    }

    private boolean isLab(Subject subject) {
        String code = subject.getSubjectCode() == null ? "" : subject.getSubjectCode().toLowerCase();
        String name = subject.getSubjectName() == null ? "" : subject.getSubjectName().toLowerCase();
        return code.contains("lab") || name.contains("lab");
    }

    private boolean isLabOrActivity(Subject subject) {
        String code = subject.getSubjectCode() == null ? "" : subject.getSubjectCode().toLowerCase();
        String name = subject.getSubjectName() == null ? "" : subject.getSubjectName().toLowerCase();
        return isLab(subject)
                || name.contains("activity")
                || name.contains("practicum")
                || code.contains("act");
    }

    private boolean isApprovedAllocation(FacultySubject facultySubject) {
        String status = facultySubject.getApprovalStatus();
        if (status == null || status.isBlank()) {
            return true; // Backward compatibility for legacy data.
        }
        return APPROVAL_STATUS_APPROVED.equalsIgnoreCase(status.trim());
    }

    private boolean canCurrentUserGenerateTimetable(User currentUser) {
        if (currentUser == null) {
            return false;
        }
        boolean adminOrHod = currentUser.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .anyMatch(authority -> authority.equals("ROLE_ADMIN") || authority.equals("ROLE_HOD"));
        if (adminOrHod) {
            return true;
        }
        boolean faculty = currentUser.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .anyMatch("ROLE_FACULTY"::equals);
        return faculty;
    }

    private String normalizeConfiguredGeneratorUsername() {
        return generatorFacultyUsername == null ? "" : generatorFacultyUsername.trim().toLowerCase();
    }

    private Long dailySubjectKey(String day, Long subjectId) {
        return Math.abs(Objects.hash(day, subjectId)) + 0L;
    }

    private int clamp(Integer input, int min, int max, int defaultValue) {
        if (input == null) return defaultValue;
        return Math.max(min, Math.min(max, input));
    }

    private String facultyLabel(User faculty) {
        if (faculty == null) {
            return "Unassigned";
        }
        String firstName = faculty.getFirstName() == null ? "" : faculty.getFirstName().trim();
        String lastName = faculty.getLastName() == null ? "" : faculty.getLastName().trim();
        String full = (firstName + " " + lastName).trim();
        return full.isBlank() ? faculty.getUsername() : full;
    }

    private String formatPrintLine(TimetableSlot slot, boolean includeSection) {
        int period = resolvePeriodNumber(slot.getStartTime());
        String day = slot.getDayOfWeek() == null ? "-" : slot.getDayOfWeek().toUpperCase();
        String subject = slot.getSubject() == null
                ? "FREE PERIOD"
                : ((slot.getSubject().getSubjectCode() == null ? "" : slot.getSubject().getSubjectCode() + " - ")
                + (slot.getSubject().getSubjectName() == null ? "-" : slot.getSubject().getSubjectName()));
        String faculty = facultyLabel(slot.getFaculty());
        String line = day + " -> Period " + period + " -> " + subject + " -> " + faculty;
        if (includeSection) {
            line = line + " [Section: " + normalizeSection(slot.getSection()) + "]";
        }
        return line;
    }

    private int resolvePeriodNumber(String startTime) {
        if (startTime == null || startTime.isBlank()) {
            return 0;
        }
        try {
            LocalTime slotStart = LocalTime.parse(startTime);
            int minutes = (int) java.time.Duration.between(WORK_DAY_START, slotStart).toMinutes();
            if (minutes < 0) return 0;
            return (minutes / FIXED_PERIOD_DURATION_MINUTES) + 1;
        } catch (Exception ignored) {
            return 0;
        }
    }

    private int dayRank(TimetableSlot slot) {
        return dayRank(slot.getDayOfWeek());
    }

    private int dayRank(String day) {
        String normalized = day == null ? "" : day.trim().toUpperCase();
        int index = DEFAULT_DAYS.indexOf(normalized);
        return index >= 0 ? index : Integer.MAX_VALUE;
    }

    private byte[] buildDepartmentPdf(Department department, List<TimetableSlot> slots, List<String> sections, Integer semesterNumber) {
        try (PDDocument document = new PDDocument()) {
            Map<String, List<TimetableSlot>> bySection = slots.stream()
                    .collect(Collectors.groupingBy(slot -> normalizeSection(slot.getSection())));
            for (String section : sections) {
                PDPage page = new PDPage(new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth()));
                document.addPage(page);
                try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                    float y = page.getMediaBox().getHeight() - 40;
                    content.beginText();
                    content.setFont(PDType1Font.HELVETICA_BOLD, 12);
                    content.newLineAtOffset(40, y);
                    content.showText(truncatePdfText("Department of " + (department.getDeptName() == null ? department.getCode() : department.getDeptName()), 80));
                    content.endText();

                    y -= 18;
                    content.beginText();
                    content.setFont(PDType1Font.HELVETICA_BOLD, 11);
                    content.newLineAtOffset(40, y);
                    content.showText(truncatePdfText("Class Timetable | Section: " + section + " | Semester: " + (semesterNumber == null ? "-" : semesterNumber), 90));
                    content.endText();

                    float tableTop = y - 20;
                    float left = 40;
                    float rowHeight = 22;
                    float[] colWidths = {80, 105, 105, 70, 105, 105, 70, 105, 105};
                    String[] header = {"Day", "P1", "P2", "Break", "P3", "P4", "Lunch", "P5", "P6/P7"};
                    drawRow(content, left, tableTop, colWidths, rowHeight, header, true);

                    List<TimetableSlot> sectionSlots = bySection.getOrDefault(section, Collections.emptyList());
                    for (int i = 0; i < DEFAULT_DAYS.size(); i++) {
                        String day = DEFAULT_DAYS.get(i);
                        float rowY = tableTop - ((i + 1) * rowHeight);
                        String p1 = cellForPeriod(sectionSlots, day, 0);
                        String p2 = cellForPeriod(sectionSlots, day, 1);
                        String p3 = cellForPeriod(sectionSlots, day, 2);
                        String p4 = cellForPeriod(sectionSlots, day, 3);
                        String p5 = cellForPeriod(sectionSlots, day, 4);
                        String p6 = cellForPeriod(sectionSlots, day, 5);
                        String p7 = cellForPeriod(sectionSlots, day, 6);
                        drawRow(
                                content,
                                left,
                                rowY,
                                colWidths,
                                rowHeight,
                                new String[]{
                                        day.substring(0, 1) + day.substring(1).toLowerCase(),
                                        p1, p2, "BREAK",
                                        p3, p4, "LUNCH",
                                        p5, p6 + (p7.equals("-") ? "" : " | " + p7)
                                },
                                false
                        );
                    }

                    float summaryStart = tableTop - ((DEFAULT_DAYS.size() + 1) * rowHeight) - 28;
                    content.beginText();
                    content.setFont(PDType1Font.HELVETICA_BOLD, 10);
                    content.newLineAtOffset(40, summaryStart);
                    content.showText("Allocation Summary");
                    content.endText();

                    Map<String, String> subjectFaculty = sectionSlots.stream()
                            .filter(slot -> slot.getSubject() != null)
                            .collect(Collectors.toMap(
                                    slot -> slot.getSubject().getSubjectCode() + " - " + slot.getSubject().getSubjectName(),
                                    slot -> anonymizedFacultyName(slot.getFaculty()),
                                    (oldVal, newVal) -> oldVal,
                                    TreeMap::new
                            ));
                    float sy = summaryStart - 16;
                    for (Map.Entry<String, String> entry : subjectFaculty.entrySet()) {
                        content.beginText();
                        content.setFont(PDType1Font.HELVETICA, 9);
                        content.newLineAtOffset(42, sy);
                        content.showText(entry.getKey() + " | " + entry.getValue());
                        content.endText();
                        sy -= 12;
                        if (sy < 30) {
                            break;
                        }
                    }
                }
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        } catch (IOException ex) {
            throw new RuntimeException("Failed to export timetable PDF.", ex);
        }
    }

    private void drawRow(PDPageContentStream content, float left, float y, float[] colWidths, float rowHeight, String[] cells, boolean header) throws IOException {
        float x = left;
        content.setLineWidth(0.5f);
        for (int i = 0; i < colWidths.length; i++) {
            float width = colWidths[i];
            content.addRect(x, y, width, rowHeight);
            content.stroke();
            String text = i < cells.length ? cells[i] : "";
            content.beginText();
            content.setFont(header ? PDType1Font.HELVETICA_BOLD : PDType1Font.HELVETICA, header ? 9 : 8);
            content.newLineAtOffset(x + 3, y + 7);
            content.showText(text == null ? "" : truncatePdfText(text, 24));
            content.endText();
            x += width;
        }
    }

    private String truncatePdfText(String value, int max) {
        if (value == null) return "";
        String safe = value.replaceAll("[^\\x20-\\x7E]", " ").replaceAll("\\s+", " ").trim();
        return safe.length() <= max ? safe : safe.substring(0, max - 1) + "...";
    }

    private String cellForPeriod(List<TimetableSlot> slots, String day, int periodIndex) {
        return slots.stream()
                .filter(slot -> day.equalsIgnoreCase(slot.getDayOfWeek()))
                .filter(slot -> resolvePeriodNumber(slot.getStartTime()) == periodIndex + 1)
                .findFirst()
                .map(slot -> {
                    if (slot.getSubject() == null) return "FREE";
                    String code = slot.getSubject().getSubjectCode() == null ? "SUB" : slot.getSubject().getSubjectCode();
                    return code;
                })
                .orElse("-");
    }

    private String anonymizedFacultyName(User faculty) {
        if (faculty == null || faculty.getUserId() == null) {
            return "Mock Faculty";
        }
        long suffix = (faculty.getUserId() % 97L) + 1L;
        return "Faculty-" + String.format("%02d", suffix);
    }

    private byte[] buildFallbackPdf(Department department, List<String> sections, Integer semesterNumber, String reason) {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth()));
            document.addPage(page);
            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                float y = page.getMediaBox().getHeight() - 60;
                content.beginText();
                content.setFont(PDType1Font.HELVETICA_BOLD, 14);
                content.newLineAtOffset(40, y);
                content.showText("Department Timetable Export");
                content.endText();
                y -= 24;
                content.beginText();
                content.setFont(PDType1Font.HELVETICA, 11);
                content.newLineAtOffset(40, y);
                content.showText(truncatePdfText("Department: " + (department == null ? "-" : department.getCode()), 100));
                content.endText();
                y -= 16;
                content.beginText();
                content.setFont(PDType1Font.HELVETICA, 11);
                content.newLineAtOffset(40, y);
                content.showText(truncatePdfText("Semester: " + (semesterNumber == null ? "-" : semesterNumber), 100));
                content.endText();
                y -= 16;
                content.beginText();
                content.setFont(PDType1Font.HELVETICA, 11);
                content.newLineAtOffset(40, y);
                content.showText(truncatePdfText("Sections: " + String.join(", ", sections), 140));
                content.endText();
                y -= 22;
                content.beginText();
                content.setFont(PDType1Font.HELVETICA_OBLIQUE, 10);
                content.newLineAtOffset(40, y);
                content.showText(truncatePdfText("Optimized timetable generated. Using simplified fallback export format.", 140));
                content.endText();
                if (reason != null && !reason.isBlank()) {
                    y -= 14;
                    content.beginText();
                    content.setFont(PDType1Font.HELVETICA, 9);
                    content.newLineAtOffset(40, y);
                    content.showText(truncatePdfText("Note: " + reason, 140));
                    content.endText();
                }
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        } catch (IOException ioEx) {
            throw new RuntimeException("Failed to export timetable PDF.", ioEx);
        }
    }

    private static Map<String, Integer> buildCurriculumPeriodMap() {
        Map<String, Integer> periods = new HashMap<>();

        // CSBS curriculum (from Curriculum/CSBS Regulations.pdf): weekly contact periods (L+T+P)
        periods.put("HS23111", 3); // Communicative English
        periods.put("CY23111", 3); // Engineering Chemistry
        periods.put("MA23111", 4); // Matrices and Calculus
        periods.put("GE23131", 3); // Engineering Graphics
        periods.put("GE23121", 2); // Problem Solving and C Lab
        periods.put("CY23121", 2); // Chemistry Lab

        periods.put("HS23211", 3); // Professional English
        periods.put("MA23211", 4); // Statistics and Numerical Methods
        periods.put("PH23211", 3); // Physics for Information Science
        periods.put("GE23211", 3); // Basic EEE
        periods.put("AD23211", 4); // Python for Data Science
        periods.put("PH23221", 2); // Physics Lab
        periods.put("GE23221", 2); // Engineering Practices Lab
        periods.put("AD23221", 2); // Python Lab

        periods.put("MA23311", 4); // Discrete Mathematics
        periods.put("CB23311", 4); // Fundamentals of Economics and Financial Accounting
        periods.put("CS23312", 3); // Object Oriented Programming
        periods.put("CS23322", 2); // OOP Lab
        periods.put("CS23314", 4); // Data Structures and Algorithms
        periods.put("CS23324", 2); // DSA Lab
        periods.put("EC23331", 4); // Digital Principles and Computer Organization

        periods.put("MA23411", 4); // Probability and Statistics
        periods.put("CB23411", 4); // Introduction to Business Systems
        periods.put("CS23411", 3); // DBMS
        periods.put("CS23421", 2); // DBMS Lab
        periods.put("CS23412", 3); // Operating Systems
        periods.put("CS23422", 2); // OS Lab
        periods.put("AL23431", 4); // AI and ML

        periods.put("CB23511", 3); // Data and Information Security
        periods.put("CB23512", 3); // Fundamentals of Management
        periods.put("CS23513", 4); // Cryptography and Cyber Security
        periods.put("CB23521", 2); // Data and Information Security Lab
        periods.put("GE23521", 2); // Business Communication Lab-I
        periods.put("CB23531", 4); // Business Analytics

        // CSE semester-4 timetable (from provided departmental references): contact periods.
        periods.put("CS23411", 4); // Database Management Systems
        periods.put("CS23412", 4); // Operating Systems
        periods.put("CS23413", 5); // Theory of Computation
        periods.put("CS23414", 4); // Software Development Practices
        periods.put("AL23432", 6); // Machine Learning Techniques
        periods.put("CS23431", 6); // Design and Analysis of Algorithms
        periods.put("CS23421", 2); // Database Management Systems Laboratory
        periods.put("CS23422", 2); // Operating Systems Laboratory
        periods.put("CS231C2", 1); // Visualization Tools

        // CSE curriculum may vary by regulation; keep robust defaults by subject type and semester.
        return Collections.unmodifiableMap(periods);
    }

    private record RequirementUnit(String section, Subject subject, User facultyUser, int requiredPeriods) { }
    private record SlotKey(String day, int periodIndex, String startTime, String endTime) { }
    private record Assignment(String section, Subject subject, User faculty, SlotKey slotKey) { }
    private record FallbackAssignment(RequirementUnit unit, Assignment assignment) { }
    private record SlotPair(SlotKey first, SlotKey second) { }
    private record TimetableMatrices(
            Map<String, List<TimetableMatrixEntryDto>> classWise,
            Map<String, List<TimetableMatrixEntryDto>> facultyWise
    ) { }
}
