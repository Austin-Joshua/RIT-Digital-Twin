package com.university.erp.service;

import com.university.erp.dto.TimetableGenerateRequest;
import com.university.erp.dto.TimetableGeneratorAccessDto;
import com.university.erp.dto.TimetableGenerationResponseDto;
import com.university.erp.dto.TimetableUnscheduledItemDto;
import com.university.erp.dto.TimetableValidationReportDto;
import com.university.erp.model.*;
import com.university.erp.repository.*;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TimetableService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final List<String> DEFAULT_DAYS = List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY");
    private static final LocalTime WORK_DAY_START = LocalTime.of(8, 0);
    private static final LocalTime WORK_DAY_END = LocalTime.of(15, 0);
    private static final int FIXED_PERIOD_DURATION_MINUTES = 50;
    private static final int FIXED_PERIODS_PER_DAY = (int) ((WORK_DAY_END.toSecondOfDay() - WORK_DAY_START.toSecondOfDay()) / (FIXED_PERIOD_DURATION_MINUTES * 60L));
    private static final Map<String, Integer> CURRICULUM_PERIODS_BY_CODE = buildCurriculumPeriodMap();

    private final TimetableSlotRepository timetableSlotRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultySubjectRepository facultySubjectRepository;
    private final TimetableSubjectRequirementRepository requirementRepository;
    @Value("${app.timetable.generator-faculty-username:}")
    private String generatorFacultyUsername;

    public TimetableService(
            TimetableSlotRepository timetableSlotRepository,
            StudentRepository studentRepository,
            DepartmentRepository departmentRepository,
            FacultySubjectRepository facultySubjectRepository,
            TimetableSubjectRequirementRepository requirementRepository
    ) {
        this.timetableSlotRepository = timetableSlotRepository;
        this.studentRepository = studentRepository;
        this.departmentRepository = departmentRepository;
        this.facultySubjectRepository = facultySubjectRepository;
        this.requirementRepository = requirementRepository;
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
    public List<TimetableSlot> getAdminTimetable(Long deptId, String section) {
        if (section == null || section.isBlank()) {
            return timetableSlotRepository.findByDepartmentId(deptId);
        }
        return timetableSlotRepository.findByDepartmentIdAndSection(deptId, section.trim());
    }

    @Transactional(readOnly = true)
    public TimetableGeneratorAccessDto getTimetableGeneratorAccess(User currentUser) {
        boolean canGenerate = canCurrentUserGenerateTimetable(currentUser);
        String configured = normalizeConfiguredGeneratorUsername();
        String message = canGenerate
                ? "You are authorized to generate timetable allocation."
                : (configured.isEmpty()
                    ? "Generator faculty is not configured. Set app.timetable.generator-faculty-username."
                    : "Only configured faculty '" + configured + "' can generate timetable allocation.");
        return TimetableGeneratorAccessDto.builder()
                .canGenerate(canGenerate)
                .configuredFacultyUsername(configured.isEmpty() ? null : configured)
                .message(message)
                .build();
    }

    @Transactional
    @CacheEvict(cacheNames = "studentTimetable", allEntries = true)
    public TimetableGenerationResponseDto generateWeeklyTimetable(TimetableGenerateRequest request, User currentUser) {
        if (!canCurrentUserGenerateTimetable(currentUser)) {
            throw new RuntimeException("You are not allowed to generate timetable. Only the configured faculty can perform this action.");
        }
        if (request == null || request.getDeptId() == null) {
            throw new RuntimeException("Department is required");
        }

        Department dept = departmentRepository.findById(request.getDeptId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        int periodsPerDay = FIXED_PERIODS_PER_DAY;
        int periodDurationMinutes = FIXED_PERIOD_DURATION_MINUTES;
        boolean strictMode = request.getStrictMode() == null || request.getStrictMode();
        int semesterNumber = request.getSemesterNumber() == null ? 0 : request.getSemesterNumber();
        List<String> days = DEFAULT_DAYS.subList(0, clamp(request.getDaysPerWeek(), 1, DEFAULT_DAYS.size(), DEFAULT_DAYS.size()));

        List<String> sections = resolveSections(request, dept.getId());
        if (sections.isEmpty()) {
            throw new RuntimeException("No target sections found for timetable generation.");
        }

        List<FacultySubject> allocations = facultySubjectRepository.findBySubject_Department_Id(dept.getId()).stream()
                .filter(fs -> fs.getSection() != null && sections.contains(normalizeSection(fs.getSection())))
                .filter(fs -> semesterNumber == 0 || (fs.getSemester() != null && semesterNumber == fs.getSemester().getSemesterNumber()))
                .toList();

        if (allocations.isEmpty()) {
            throw new RuntimeException("No faculty-subject allocation found for selected scope.");
        }

        List<RequirementUnit> requirementUnits = buildRequirementUnits(dept, sections, allocations, semesterNumber);
        int totalDemand = requirementUnits.stream().mapToInt(RequirementUnit::requiredPeriods).sum();

        List<SlotKey> slotKeys = buildSlotKeys(days, periodsPerDay);
        Map<SlotKey, List<Assignment>> assignmentsBySlot = new LinkedHashMap<>();
        Map<String, Set<SlotKey>> sectionOccupied = new HashMap<>();
        Map<Long, Set<SlotKey>> facultyOccupied = new HashMap<>();
        Map<String, Map<Long, Integer>> sectionDailySubjectCount = new HashMap<>();
        Map<RequirementUnit, Integer> scheduledCount = new LinkedHashMap<>();
        List<TimetableUnscheduledItemDto> unscheduledItems = new ArrayList<>();

        requirementUnits.sort(Comparator.comparingInt(RequirementUnit::requiredPeriods).reversed());
        for (RequirementUnit unit : requirementUnits) {
            if (isLabOrActivity(unit.subject())) {
                int pairedTarget = unit.requiredPeriods() / 2;
                for (int i = 0; i < pairedTarget; i++) {
                    SlotPair pair = pickBestConsecutiveSlotPair(unit, slotKeys, sectionOccupied, facultyOccupied, sectionDailySubjectCount);
                    if (pair == null) {
                        break;
                    }
                    Assignment a1 = new Assignment(unit.section(), unit.subject(), unit.facultyUser(), pair.first());
                    Assignment a2 = new Assignment(unit.section(), unit.subject(), unit.facultyUser(), pair.second());
                    placeAssignment(unit, a1, assignmentsBySlot, sectionOccupied, facultyOccupied, sectionDailySubjectCount);
                    placeAssignment(unit, a2, assignmentsBySlot, sectionOccupied, facultyOccupied, sectionDailySubjectCount);
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
                SlotKey picked = pickBestSlot(unit, slotKeys, sectionOccupied, facultyOccupied, sectionDailySubjectCount);
                if (picked == null) {
                    break;
                }
                Assignment assignment = new Assignment(unit.section(), unit.subject(), unit.facultyUser(), picked);
                placeAssignment(unit, assignment, assignmentsBySlot, sectionOccupied, facultyOccupied, sectionDailySubjectCount);
                done++;
            }
            scheduledCount.put(unit, done);
            if (done < unit.requiredPeriods()) {
                unscheduledItems.add(TimetableUnscheduledItemDto.builder()
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
        }

        if (strictMode && !unscheduledItems.isEmpty()) {
            TimetableValidationReportDto report = buildValidationReport(totalDemand, scheduledCount, unscheduledItems, assignmentsBySlot, slotKeys);
            return TimetableGenerationResponseDto.builder()
                    .success(false)
                    .message("Timetable generation failed in strict mode due to unscheduled requirements.")
                    .slots(Collections.emptyList())
                    .validation(report)
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

        TimetableValidationReportDto report = buildValidationReport(totalDemand, scheduledCount, unscheduledItems, assignmentsBySlot, slotKeys);
        return TimetableGenerationResponseDto.builder()
                .success(unscheduledItems.isEmpty())
                .message(unscheduledItems.isEmpty()
                        ? "Timetable generated successfully."
                        : "Timetable generated with unresolved requirements.")
                .slots(saved.stream()
                        .sorted(Comparator.comparing(TimetableSlot::getSection)
                                .thenComparing(TimetableSlot::getDayOfWeek)
                                .thenComparing(TimetableSlot::getStartTime))
                        .toList())
                .validation(report)
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
            Map<String, Map<Long, Integer>> sectionDailySubjectCount
    ) {
        SlotKey slot = assignment.slotKey();
        assignmentsBySlot.computeIfAbsent(slot, key -> new ArrayList<>()).add(assignment);
        sectionOccupied.computeIfAbsent(unit.section(), key -> new HashSet<>()).add(slot);
        facultyOccupied.computeIfAbsent(unit.facultyUser().getUserId(), key -> new HashSet<>()).add(slot);
        sectionDailySubjectCount
                .computeIfAbsent(unit.section(), key -> new HashMap<>())
                .merge(dailySubjectKey(slot.day(), unit.subject().getId()), 1, Integer::sum);
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

            int periods = resolveWeeklyPeriods(requirementsBySection.getOrDefault(section, Collections.emptyList()), fs);
            if (periods <= 0 || fs.getFaculty() == null || fs.getFaculty().getUser() == null) {
                continue;
            }
            units.add(new RequirementUnit(section, fs.getSubject(), fs.getFaculty().getUser(), periods));
        }
        return units;
    }

    private int resolveWeeklyPeriods(List<TimetableSubjectRequirement> requirements, FacultySubject fs) {
        for (TimetableSubjectRequirement req : requirements) {
            if (req.getSubject() != null && fs.getSubject() != null
                    && Objects.equals(req.getSubject().getId(), fs.getSubject().getId())) {
                return req.getPeriodsPerWeek() == null ? 0 : req.getPeriodsPerWeek();
            }
        }
        return fallbackPeriodsFromSubject(fs.getSubject());
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
            Map<String, Map<Long, Integer>> sectionDailySubjectCount
    ) {
        SlotKey best = null;
        int bestScore = Integer.MIN_VALUE;
        Set<SlotKey> classBusy = sectionOccupied.getOrDefault(unit.section(), Collections.emptySet());
        Set<SlotKey> facultyBusy = facultyOccupied.getOrDefault(unit.facultyUser().getUserId(), Collections.emptySet());

        for (SlotKey key : allKeys) {
            if (classBusy.contains(key) || facultyBusy.contains(key)) continue;

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
            Map<String, Map<Long, Integer>> sectionDailySubjectCount
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
            List<SlotKey> validKeys
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

        Map<String, Integer> dailyLoadBySection = new TreeMap<>();
        for (Map.Entry<SlotKey, List<Assignment>> entry : assignmentsBySlot.entrySet()) {
            for (Assignment assignment : entry.getValue()) {
                String key = assignment.section() + "-" + entry.getKey().day();
                dailyLoadBySection.merge(key, 1, Integer::sum);
            }
        }

        return TimetableValidationReportDto.builder()
                .facultyClashFree(facultyClashes == 0)
                .classClashFree(classClashes == 0)
                .allSubjectsScheduled(unscheduledItems.isEmpty())
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

    private List<SlotKey> buildSlotKeys(List<String> days, int periodsPerDay) {
        List<SlotKey> keys = new ArrayList<>();
        LocalTime start = WORK_DAY_START;
        for (String day : days) {
            for (int period = 0; period < periodsPerDay; period++) {
                LocalTime periodStart = start.plusMinutes(period * FIXED_PERIOD_DURATION_MINUTES);
                LocalTime periodEnd = periodStart.plusMinutes(FIXED_PERIOD_DURATION_MINUTES);
                keys.add(new SlotKey(day, period, periodStart.format(TIME_FORMATTER), periodEnd.format(TIME_FORMATTER)));
            }
        }
        return keys;
    }

    private List<String> resolveSections(TimetableGenerateRequest request, Long deptId) {
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
        if (sections.isEmpty()) {
            sections.addAll(studentRepository.findDistinctSectionsByDepartmentId(deptId));
        }
        return sections.stream().filter(section -> section != null && !section.isBlank()).toList();
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
        if (!faculty) {
            return false;
        }
        String configured = normalizeConfiguredGeneratorUsername();
        if (configured.isEmpty()) {
            return false;
        }
        String username = currentUser.getUsername() == null ? "" : currentUser.getUsername().trim().toLowerCase();
        String email = currentUser.getEmail() == null ? "" : currentUser.getEmail().trim().toLowerCase();
        return configured.equals(username) || configured.equals(email);
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
        String firstName = faculty.getFirstName() == null ? "" : faculty.getFirstName().trim();
        String lastName = faculty.getLastName() == null ? "" : faculty.getLastName().trim();
        String full = (firstName + " " + lastName).trim();
        return full.isBlank() ? faculty.getUsername() : full;
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

        // CSE curriculum PDF is image-based; keep robust defaults by subject type and semester.
        return Collections.unmodifiableMap(periods);
    }

    private record RequirementUnit(String section, Subject subject, User facultyUser, int requiredPeriods) { }
    private record SlotKey(String day, int periodIndex, String startTime, String endTime) { }
    private record Assignment(String section, Subject subject, User faculty, SlotKey slotKey) { }
    private record SlotPair(SlotKey first, SlotKey second) { }
}
