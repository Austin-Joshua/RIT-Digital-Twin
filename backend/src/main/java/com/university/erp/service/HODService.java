package com.university.erp.service;

import com.university.erp.model.*;
import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HODService {

    private static final String H_AND_S_DEPARTMENT_CODE = "SANDH"; // Science and Humanities — first year only
    private static final BigDecimal WEAK_AVG_THRESHOLD = new BigDecimal("50");
    private static final double WEAK_FAILURE_RATE_THRESHOLD = 0.3;

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final MarksRepository marksRepository;
    private final AttendanceRepository attendanceRepository;
    private final DepartmentRepository departmentRepository;

    private boolean isHandSDepartment(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .map(d -> H_AND_S_DEPARTMENT_CODE.equalsIgnoreCase(d.getCode()))
                .orElse(false);
    }

    private List<Student> getStudentsUnderHod(Long departmentId) {
        if (isHandSDepartment(departmentId)) {
            return studentRepository.findByYear(1);
        }
        return studentRepository.findByDepartment_IdAndYearGreaterThanEqual(departmentId, 2);
    }

    private Set<Long> getStudentIdsUnderHod(Long departmentId) {
        return getStudentsUnderHod(departmentId).stream().map(Student::getId).collect(Collectors.toSet());
    }

    @Cacheable(value = "dept_stats", key = "#departmentId")
    public Map<String, Object> getDepartmentStats(Long departmentId) {
        ensureDepartmentExists(departmentId);
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("departmentId", departmentId);
        stats.put("departmentCode", departmentRepository.findById(departmentId).map(Department::getCode).orElse(null));
        stats.put("isHandS", isHandSDepartment(departmentId));
        stats.put("totalFaculty", userRepository.countByRole_RoleNameAndDepartment_Id(Role.UserRole.FACULTY, departmentId));

        if (isHandSDepartment(departmentId)) {
            long y1 = studentRepository.countByYear(1);
            stats.put("totalStudents", y1);
            stats.put("year1Count", y1);
            stats.put("year2Count", 0L);
            stats.put("year3Count", 0L);
            stats.put("year4Count", 0L);
            stats.put("newJoinersCount", null);
        } else {
            long y2 = studentRepository.countByDepartment_IdAndYear(departmentId, 2);
            long y3 = studentRepository.countByDepartment_IdAndYear(departmentId, 3);
            long y4 = studentRepository.countByDepartment_IdAndYear(departmentId, 4);
            stats.put("totalStudents", y2 + y3 + y4);
            stats.put("year1Count", 0L);
            stats.put("year2Count", y2);
            stats.put("year3Count", y3);
            stats.put("year4Count", y4);
            stats.put("newJoinersCount", y2);
        }
        return stats;
    }

    @Cacheable(value = "dept_analytics", key = "#departmentId")
    public Map<String, Object> getDepartmentAnalytics(Long departmentId) {
        ensureDepartmentExists(departmentId);
        boolean isHandS = isHandSDepartment(departmentId);

        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("departmentId", departmentId);
        analytics.put("isHandS", isHandS);

        // Compute marks metrics directly via database-level aggregation
        List<Object[]> marksRows = isHandS
                ? marksRepository.getFirstYearMarksSummary()
                : marksRepository.getDepartmentMarksSummary(departmentId, 2);

        BigDecimal avgMarks = null;
        BigDecimal avgInternal = null;
        BigDecimal passPercentage = null;

        if (marksRows != null && !marksRows.isEmpty() && marksRows.get(0) != null) {
            Object[] row = marksRows.get(0);
            Double avgMarksVal = row[0] != null ? ((Number) row[0]).doubleValue() : null;
            Double avgInternalVal = row[1] != null ? ((Number) row[1]).doubleValue() : null;
            long passCount = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            long totalGraded = row[3] != null ? ((Number) row[3]).longValue() : 0L;

            if (avgMarksVal != null) {
                avgMarks = BigDecimal.valueOf(avgMarksVal).setScale(2, RoundingMode.HALF_UP);
            }
            if (avgInternalVal != null) {
                avgInternal = BigDecimal.valueOf(avgInternalVal).setScale(2, RoundingMode.HALF_UP);
            }
            if (totalGraded > 0) {
                passPercentage = BigDecimal.valueOf(100.0 * passCount / totalGraded).setScale(2, RoundingMode.HALF_UP);
            }
        }

        analytics.put("averageMarks", avgMarks);
        analytics.put("passPercentage", passPercentage);
        analytics.put("internalMarksAverage", avgInternal);

        // Compute attendance metrics directly via database-level aggregation
        Double avgAtt = isHandS
                ? attendanceRepository.getFirstYearAverageAttendance()
                : attendanceRepository.getDepartmentAverageAttendance(departmentId, 2);

        analytics.put("averageAttendance", avgAtt != null ? BigDecimal.valueOf(avgAtt).setScale(2, RoundingMode.HALF_UP) : null);
        return analytics;
    }

    @Cacheable(value = "class_performance", key = "#departmentId + '-' + #sortBy")
    public List<Map<String, Object>> getClassPerformance(Long departmentId, String sortBy) {
        ensureDepartmentExists(departmentId);
        boolean isHandS = isHandSDepartment(departmentId);

        List<Object[]> marksRows = isHandS
                ? marksRepository.getFirstYearClassPerformanceMarksSummary()
                : marksRepository.getClassPerformanceMarksSummary(departmentId);

        List<Object[]> attRows = isHandS
                ? attendanceRepository.getFirstYearClassAttendanceAverages()
                : attendanceRepository.getClassAttendanceAverages(departmentId);

        Map<String, Double> attendanceMap = new HashMap<>();
        if (attRows != null) {
            for (Object[] r : attRows) {
                if (r[0] != null && r[1] != null) {
                    String key = r[0] + "-" + r[1];
                    Double avg = r[2] != null ? ((Number) r[2]).doubleValue() : null;
                    attendanceMap.put(key, avg);
                }
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        if (marksRows != null) {
            for (Object[] r : marksRows) {
                if (r[0] == null || r[1] == null) continue;
                String classKey = r[0] + "-" + r[1];
                int studentCount = r[2] != null ? ((Number) r[2]).intValue() : 0;
                Double avgScore = r[3] != null ? ((Number) r[3]).doubleValue() : null;
                long failCount = r[4] != null ? ((Number) r[4]).longValue() : 0L;
                long totalGraded = r[5] != null ? ((Number) r[5]).longValue() : 0L;

                Double classAtt = attendanceMap.get(classKey);

                Map<String, Object> row = new LinkedHashMap<>();
                row.put("class", classKey);
                row.put("studentCount", studentCount);
                row.put("academicAverage", avgScore != null ? BigDecimal.valueOf(avgScore).setScale(2, RoundingMode.HALF_UP) : null);
                row.put("attendanceAverage", classAtt != null ? BigDecimal.valueOf(classAtt).setScale(2, RoundingMode.HALF_UP) : null);
                row.put("failingCount", (int) failCount);
                row.put("totalGraded", (int) totalGraded);
                result.add(row);
            }
        }

        if ("highest".equalsIgnoreCase(sortBy)) {
            result.sort((a, b) -> {
                BigDecimal aa = (BigDecimal) a.get("academicAverage");
                BigDecimal bb = (BigDecimal) b.get("academicAverage");
                if (aa == null && bb == null) return 0;
                if (aa == null) return 1;
                if (bb == null) return -1;
                return bb.compareTo(aa);
            });
        } else if ("lowest".equalsIgnoreCase(sortBy)) {
            result.sort((a, b) -> {
                BigDecimal aa = (BigDecimal) a.get("academicAverage");
                BigDecimal bb = (BigDecimal) b.get("academicAverage");
                if (aa == null && bb == null) return 0;
                if (aa == null) return 1;
                if (bb == null) return -1;
                return aa.compareTo(bb);
            });
        } else if ("attendance".equalsIgnoreCase(sortBy)) {
            result.sort((a, b) -> {
                BigDecimal aa = (BigDecimal) a.get("attendanceAverage");
                BigDecimal bb = (BigDecimal) b.get("attendanceAverage");
                if (aa == null && bb == null) return 0;
                if (aa == null) return 1;
                if (bb == null) return -1;
                return bb.compareTo(aa);
            });
        }
        return result;
    }

    @Cacheable(value = "dept_students", key = "#departmentId + '-' + #year + '-' + #section")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudents(Long departmentId, Integer year, String section) {
        ensureDepartmentExists(departmentId);
        boolean isHandS = isHandSDepartment(departmentId);

        List<Student> students;
        if (isHandS) {
            if (section != null && !section.isBlank()) {
                students = studentRepository.findBySectionIgnoreCase(section).stream()
                        .filter(s -> s.getYear() != null && s.getYear() == 1)
                        .toList();
            } else {
                students = studentRepository.findByYear(1);
            }
        } else {
            if (year != null && section != null && !section.isBlank()) {
                students = studentRepository.findBySectionIgnoreCase(section).stream()
                        .filter(s -> s.getDepartment() != null && s.getDepartment().getId().equals(departmentId) && year.equals(s.getYear()))
                        .toList();
            } else if (year != null) {
                students = studentRepository.findByDepartmentId(departmentId).stream()
                        .filter(s -> year.equals(s.getYear()))
                        .toList();
            } else if (section != null && !section.isBlank()) {
                students = studentRepository.findBySectionIgnoreCase(section).stream()
                        .filter(s -> s.getDepartment() != null && s.getDepartment().getId().equals(departmentId) && s.getYear() != null && s.getYear() >= 2)
                        .toList();
            } else {
                students = studentRepository.findByDepartment_IdAndYearGreaterThanEqual(departmentId, 2);
            }
        }

        List<Map<String, Object>> list = new ArrayList<>(students.size());
        for (Student s : students) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("studentId", s.getId());
            map.put("studentIdNumber", s.getStudentIdNumber());
            map.put("year", s.getYear());
            map.put("section", s.getSection());
            map.put("currentCgpa", s.getCurrentCgpa());
            if (isHandS && s.getDepartment() != null) {
                map.put("branchCode", s.getDepartment().getCode());
                map.put("branchName", s.getDepartment().getDeptName());
            }
            if (s.getUser() != null) {
                map.put("email", s.getUser().getEmail());
                map.put("name", (s.getUser().getFirstName() != null ? s.getUser().getFirstName() : "") + " " + (s.getUser().getLastName() != null ? s.getUser().getLastName() : ""));
            }
            list.add(map);
        }
        return list;
    }

    @Cacheable(value = "dept_faculty", key = "#departmentId")
    public List<Map<String, Object>> getFaculty(Long departmentId) {
        ensureDepartmentExists(departmentId);
        List<User> faculty = userRepository.findByRole_RoleNameAndDepartment_Id(Role.UserRole.FACULTY, departmentId);
        List<Map<String, Object>> list = new ArrayList<>(faculty.size());
        for (User u : faculty) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("userId", u.getUserId());
            map.put("email", u.getEmail());
            map.put("username", u.getUsername());
            map.put("firstName", u.getFirstName());
            map.put("lastName", u.getLastName());
            list.add(map);
        }
        return list;
    }

    @Cacheable(value = "dept_heatmap", key = "#departmentId")
    public List<Map<String, Object>> getSubjectHeatmap(Long departmentId) {
        ensureDepartmentExists(departmentId);
        Set<Long> deptStudentIds = getStudentIdsUnderHod(departmentId);
        if (deptStudentIds.isEmpty()) return Collections.emptyList();
        List<Marks> deptMarks = marksRepository.findAllByStudentIdIn(deptStudentIds);

        Map<String, Map<String, List<BigDecimal>>> subjectClassScores = new LinkedHashMap<>();
        for (Marks m : deptMarks) {
            if (!deptStudentIds.contains(m.getStudent().getId())) continue;
            if (m.getStudent().getYear() == null || m.getStudent().getSection() == null) continue;
            Long subjId = m.getSubject().getId();
            String subjName = m.getSubject().getSubjectName() != null ? m.getSubject().getSubjectName() : "Subject " + subjId;
            String classKey = m.getStudent().getYear() + "-" + m.getStudent().getSection();
            subjectClassScores.computeIfAbsent(subjName, k -> new LinkedHashMap<>())
                    .computeIfAbsent(classKey, k -> new ArrayList<>());
            if (m.getTotalScore() != null) subjectClassScores.get(subjName).get(classKey).add(m.getTotalScore());
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map.Entry<String, Map<String, List<BigDecimal>>> e : subjectClassScores.entrySet()) {
            for (Map.Entry<String, List<BigDecimal>> ce : e.getValue().entrySet()) {
                if (ce.getValue().isEmpty()) continue;
                BigDecimal avg = ce.getValue().stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(ce.getValue().size()), 2, RoundingMode.HALF_UP);
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("subject", e.getKey());
                row.put("class", ce.getKey());
                row.put("averageScore", avg);
                row.put("performance", avg.compareTo(new BigDecimal("70")) >= 0 ? "strong" : avg.compareTo(new BigDecimal("50")) >= 0 ? "average" : "weak");
                rows.add(row);
            }
        }
        return rows;
    }

    @Cacheable(value = "dept_weak_subjects", key = "#departmentId + '-' + #avgThreshold + '-' + #failureRateThreshold")
    public List<Map<String, Object>> getWeakSubjects(Long departmentId, BigDecimal avgThreshold, Double failureRateThreshold) {
        ensureDepartmentExists(departmentId);
        Set<Long> studentIds = getStudentIdsUnderHod(departmentId);
        if (studentIds.isEmpty()) return Collections.emptyList();
        if (avgThreshold == null) avgThreshold = WEAK_AVG_THRESHOLD;
        if (failureRateThreshold == null) failureRateThreshold = WEAK_FAILURE_RATE_THRESHOLD;
        List<Marks> deptMarks = marksRepository.findAllByStudentIdIn(studentIds);
        Map<Long, List<Marks>> bySubject = deptMarks.stream().collect(Collectors.groupingBy(m -> m.getSubject().getId()));
        List<Map<String, Object>> weak = new ArrayList<>();
        for (Map.Entry<Long, List<Marks>> e : bySubject.entrySet()) {
            List<Marks> list = e.getValue();
            BigDecimal avg = list.stream().filter(m -> m.getTotalScore() != null).map(Marks::getTotalScore).reduce(BigDecimal.ZERO, BigDecimal::add);
            int count = (int) list.stream().filter(m -> m.getTotalScore() != null).count();
            if (count == 0) continue;
            avg = avg.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
            int failed = (int) list.stream().filter(m -> m.getGrade() != null && ("F".equalsIgnoreCase(m.getGrade()) || "AB".equalsIgnoreCase(m.getGrade()))).count();
            int graded = (int) list.stream().filter(m -> m.getGrade() != null && !m.getGrade().isEmpty()).count();
            double failRate = graded > 0 ? (double) failed / graded : 0;
            if (avg.compareTo(avgThreshold) < 0 || failRate >= failureRateThreshold) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("subjectId", e.getKey());
                m.put("subjectName", list.get(0).getSubject().getSubjectName());
                m.put("averageScore", avg);
                m.put("failureRate", BigDecimal.valueOf(failRate * 100).setScale(2, RoundingMode.HALF_UP));
                weak.add(m);
            }
        }
        return weak;
    }

    @Cacheable(value = "dept_trends", key = "#departmentId + '-' + #by")
    public List<Map<String, Object>> getPerformanceTrends(Long departmentId, String by) {
        ensureDepartmentExists(departmentId);
        Set<Long> studentIds = getStudentIdsUnderHod(departmentId);
        if (studentIds.isEmpty()) return Collections.emptyList();
        List<Marks> deptMarks = marksRepository.findAllByStudentIdIn(studentIds);
        if (deptMarks.isEmpty()) return Collections.emptyList();
        boolean byYear = "year".equalsIgnoreCase(by);
        Map<String, List<BigDecimal>> groupScores = new LinkedHashMap<>();
        for (Marks m : deptMarks) {
            if (m.getTotalScore() == null) continue;
            String key = byYear ? String.valueOf(m.getStudent().getYear()) : "Sem " + m.getSemester();
            groupScores.computeIfAbsent(key, k -> new ArrayList<>()).add(m.getTotalScore());
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, List<BigDecimal>> e : groupScores.entrySet()) {
            BigDecimal avg = e.getValue().stream().reduce(BigDecimal.ZERO, BigDecimal::add).divide(BigDecimal.valueOf(e.getValue().size()), 2, RoundingMode.HALF_UP);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put(byYear ? "year" : "semester", e.getKey());
            row.put("averageScore", avg);
            result.add(row);
        }
        result.sort(Comparator.comparing(m -> (String) m.get(byYear ? "year" : "semester")));
        return result;
    }

    @Cacheable(value = "dept_rankings", key = "#departmentId")
    public List<Map<String, Object>> getClassRankings(Long departmentId) {
        List<Map<String, Object>> classPerf = getClassPerformance(departmentId, "highest");
        int rank = 1;
        for (Map<String, Object> row : classPerf) {
            row.put("rank", rank++);
            row.put("attendanceRank", rank - 1);
        }
        return classPerf;
    }

    public Map<String, Object> getStudentPerformance(Long departmentId, Long studentId) {
        ensureDepartmentExists(departmentId);
        Student student = studentRepository.findById(studentId).orElseThrow(() -> new com.university.erp.util.ErpException.ResourceNotFoundException("Student not found"));
        boolean isHandS = isHandSDepartment(departmentId);
        boolean canAccess = isHandS
                ? (student.getYear() != null && student.getYear() == 1)
                : (student.getDepartment() != null && student.getDepartment().getId().equals(departmentId) && student.getYear() != null && student.getYear() >= 2);
        if (!canAccess) {
            throw new org.springframework.security.access.AccessDeniedException("Student not under your department.");
        }
        List<Marks> marks = marksRepository.findByStudent_Id(studentId);
        List<Attendance> att = attendanceRepository.findByStudentId(studentId);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("studentId", student.getId());
        out.put("studentIdNumber", student.getStudentIdNumber());
        out.put("year", student.getYear());
        out.put("section", student.getSection());
        out.put("marks", marks.stream().map(this::markToMap).collect(Collectors.toList()));
        out.put("attendance", att.stream().map(a -> {
            Map<String, Object> am = new LinkedHashMap<>();
            am.put("subjectId", a.getSubject() != null ? a.getSubject().getId() : null);
            am.put("percentage", a.getPercentage());
            am.put("attendedClasses", a.getAttendedClasses());
            am.put("totalClasses", a.getTotalClasses());
            return am;
        }).collect(Collectors.toList()));
        return out;
    }

    private Map<String, Object> markToMap(Marks m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("subjectId", m.getSubject().getId());
        map.put("subjectName", m.getSubject().getSubjectName());
        map.put("semester", m.getSemester());
        map.put("totalScore", m.getTotalScore());
        map.put("calculatedInternal", m.getCalculatedInternal());
        map.put("grade", m.getGrade());
        return map;
    }

    private void ensureDepartmentExists(Long departmentId) {
        departmentRepository.findById(departmentId).orElseThrow(() -> new com.university.erp.util.ErpException.ResourceNotFoundException("Department not found."));
    }
}
