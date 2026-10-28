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

    private Department findDepartmentOrThrow(Long departmentId) {
        if (departmentId == null) {
            throw new com.university.erp.util.ErpException.ResourceNotFoundException("Department not found.");
        }
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new com.university.erp.util.ErpException.ResourceNotFoundException("Department not found."));
    }

    private void ensureDepartmentExists(Long departmentId) {
        findDepartmentOrThrow(departmentId);
    }

    private boolean isHandSDepartment(Department dept) {
        return dept != null && H_AND_S_DEPARTMENT_CODE.equalsIgnoreCase(dept.getCode());
    }

    private boolean isHandSDepartment(Long departmentId) {
        if (departmentId == null) return false;
        return departmentRepository.findById(departmentId)
                .map(d -> isHandSDepartment(d))
                .orElse(false);
    }

    private List<Student> getStudentsUnderHod(Department dept) {
        if (isHandSDepartment(dept)) {
            return studentRepository.findByYear(1);
        }
        return studentRepository.findByDepartment_IdAndYearGreaterThanEqual(dept.getId(), 2);
    }

    private List<Student> getStudentsUnderHod(Long departmentId) {
        if (isHandSDepartment(departmentId)) {
            return studentRepository.findByYear(1);
        }
        return studentRepository.findByDepartment_IdAndYearGreaterThanEqual(departmentId, 2);
    }

    private Set<Long> getStudentIdsUnderHod(Department dept) {
        return getStudentsUnderHod(dept).stream()
                .filter(Objects::nonNull)
                .map(s -> s.getId())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private Set<Long> getStudentIdsUnderHod(Long departmentId) {
        return getStudentsUnderHod(departmentId).stream()
                .filter(Objects::nonNull)
                .map(s -> s.getId())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private List<Marks> fetchMarksForStudentIds(Set<Long> studentIds) {
        if (studentIds == null || studentIds.isEmpty()) return Collections.emptyList();
        List<Long> idList = new ArrayList<>(studentIds);
        int chunkSize = 500;
        if (idList.size() <= chunkSize) {
            return marksRepository.findAllByStudentIdIn(idList);
        }
        List<Marks> allMarks = new ArrayList<>(idList.size() * 5);
        for (int i = 0; i < idList.size(); i += chunkSize) {
            List<Long> chunk = idList.subList(i, Math.min(i + chunkSize, idList.size()));
            List<Marks> part = marksRepository.findAllByStudentIdIn(chunk);
            if (part != null) {
                allMarks.addAll(part);
            }
        }
        return allMarks;
    }

    @Cacheable(value = "dept_stats", key = "#departmentId")
    public Map<String, Object> getDepartmentStats(Long departmentId) {
        Department dept = findDepartmentOrThrow(departmentId);
        boolean isHandS = isHandSDepartment(dept);
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("departmentId", departmentId);
        stats.put("departmentCode", dept.getCode());
        stats.put("isHandS", isHandS);
        stats.put("totalFaculty", userRepository.countByRole_RoleNameAndDepartment_Id(Role.UserRole.FACULTY, departmentId));

        if (isHandS) {
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
        Department dept = findDepartmentOrThrow(departmentId);
        boolean isHandS = isHandSDepartment(dept);

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
            if (row.length >= 4) {
                Double avgMarksVal = row[0] != null ? ((Number) row[0]).doubleValue() : null;
                Double avgInternalVal = row[1] != null ? ((Number) row[1]).doubleValue() : null;
                long passCount = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                long totalGraded = row[3] != null ? ((Number) row[3]).longValue() : 0L;

                if (avgMarksVal != null && Double.isFinite(avgMarksVal)) {
                    avgMarks = BigDecimal.valueOf(avgMarksVal).setScale(2, RoundingMode.HALF_UP);
                }
                if (avgInternalVal != null && Double.isFinite(avgInternalVal)) {
                    avgInternal = BigDecimal.valueOf(avgInternalVal).setScale(2, RoundingMode.HALF_UP);
                }
                if (totalGraded > 0) {
                    passPercentage = BigDecimal.valueOf(100.0 * passCount / totalGraded).setScale(2, RoundingMode.HALF_UP);
                }
            }
        }

        analytics.put("averageMarks", avgMarks);
        analytics.put("passPercentage", passPercentage);
        analytics.put("internalMarksAverage", avgInternal);

        // Compute attendance metrics directly via database-level aggregation
        Double avgAtt = isHandS
                ? attendanceRepository.getFirstYearAverageAttendance()
                : attendanceRepository.getDepartmentAverageAttendance(departmentId, 2);

        analytics.put("averageAttendance", (avgAtt != null && Double.isFinite(avgAtt))
                ? BigDecimal.valueOf(avgAtt).setScale(2, RoundingMode.HALF_UP)
                : null);
        return analytics;
    }

    @Cacheable(value = "class_performance", key = "(#departmentId != null ? #departmentId : '0') + '-' + (#sortBy != null ? #sortBy : 'default')")
    public List<Map<String, Object>> getClassPerformance(Long departmentId, String sortBy) {
        Department dept = findDepartmentOrThrow(departmentId);
        boolean isHandS = isHandSDepartment(dept);

        List<Object[]> marksRows = isHandS
                ? marksRepository.getFirstYearClassPerformanceMarksSummary()
                : marksRepository.getClassPerformanceMarksSummary(departmentId);

        List<Object[]> attRows = isHandS
                ? attendanceRepository.getFirstYearClassAttendanceAverages()
                : attendanceRepository.getClassAttendanceAverages(departmentId);

        Map<String, Double> attendanceMap = new HashMap<>();
        if (attRows != null) {
            for (Object[] r : attRows) {
                if (r != null && r.length >= 3 && r[0] != null && r[1] != null) {
                    String key = r[0] + "-" + r[1];
                    Double avg = r[2] != null ? ((Number) r[2]).doubleValue() : null;
                    attendanceMap.put(key, avg);
                }
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        if (marksRows != null) {
            for (Object[] r : marksRows) {
                if (r == null || r.length < 6 || r[0] == null || r[1] == null) continue;
                String classKey = r[0] + "-" + r[1];
                int studentCount = r[2] != null ? ((Number) r[2]).intValue() : 0;
                Double avgScore = r[3] != null ? ((Number) r[3]).doubleValue() : null;
                long failCount = r[4] != null ? ((Number) r[4]).longValue() : 0L;
                long totalGraded = r[5] != null ? ((Number) r[5]).longValue() : 0L;

                Double classAtt = attendanceMap.get(classKey);

                Map<String, Object> row = new LinkedHashMap<>();
                row.put("class", classKey);
                row.put("studentCount", studentCount);
                row.put("academicAverage", (avgScore != null && Double.isFinite(avgScore)) ? BigDecimal.valueOf(avgScore).setScale(2, RoundingMode.HALF_UP) : null);
                row.put("attendanceAverage", (classAtt != null && Double.isFinite(classAtt)) ? BigDecimal.valueOf(classAtt).setScale(2, RoundingMode.HALF_UP) : null);
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

    @Cacheable(value = "dept_students", key = "(#departmentId != null ? #departmentId : '0') + '-' + (#year != null ? #year : 'all') + '-' + (#section != null ? #section : 'all')")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudents(Long departmentId, Integer year, String section) {
        Department dept = findDepartmentOrThrow(departmentId);
        boolean isHandS = isHandSDepartment(dept);

        String trimmedSection = (section != null && !section.isBlank()) ? section.trim() : null;

        List<Student> students;
        if (isHandS) {
            if (trimmedSection != null) {
                students = studentRepository.findBySectionIgnoreCase(trimmedSection).stream()
                        .filter(s -> s.getYear() != null && s.getYear() == 1)
                        .toList();
            } else {
                students = studentRepository.findByYear(1);
            }
        } else {
            if (year != null && trimmedSection != null) {
                students = studentRepository.findBySectionIgnoreCase(trimmedSection).stream()
                        .filter(s -> s.getDepartment() != null && departmentId.equals(s.getDepartment().getId()) && year.equals(s.getYear()))
                        .toList();
            } else if (year != null) {
                students = studentRepository.findByDepartmentId(departmentId).stream()
                        .filter(s -> year.equals(s.getYear()))
                        .toList();
            } else if (trimmedSection != null) {
                students = studentRepository.findBySectionIgnoreCase(trimmedSection).stream()
                        .filter(s -> s.getDepartment() != null && departmentId.equals(s.getDepartment().getId()) && s.getYear() != null && s.getYear() >= 2)
                        .toList();
            } else {
                students = studentRepository.findByDepartment_IdAndYearGreaterThanEqual(departmentId, 2);
            }
        }

        List<Map<String, Object>> list = new ArrayList<>(students.size());
        for (Student s : students) {
            if (s == null) continue;
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
                String firstName = s.getUser().getFirstName() != null ? s.getUser().getFirstName() : "";
                String lastName = s.getUser().getLastName() != null ? s.getUser().getLastName() : "";
                map.put("name", (firstName + " " + lastName).trim());
            }
            list.add(map);
        }
        return list;
    }

    @Cacheable(value = "dept_faculty", key = "#departmentId")
    public List<Map<String, Object>> getFaculty(Long departmentId) {
        findDepartmentOrThrow(departmentId);
        List<User> faculty = userRepository.findByRole_RoleNameAndDepartment_Id(Role.UserRole.FACULTY, departmentId);
        List<Map<String, Object>> list = new ArrayList<>(faculty.size());
        for (User u : faculty) {
            if (u == null) continue;
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
        Department dept = findDepartmentOrThrow(departmentId);
        Set<Long> deptStudentIds = getStudentIdsUnderHod(dept);
        if (deptStudentIds.isEmpty()) return Collections.emptyList();
        List<Marks> deptMarks = fetchMarksForStudentIds(deptStudentIds);

        Map<String, Map<String, List<BigDecimal>>> subjectClassScores = new LinkedHashMap<>();
        for (Marks m : deptMarks) {
            if (m == null || m.getStudent() == null || m.getSubject() == null) continue;
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
                BigDecimal avg = ce.getValue().stream()
                        .filter(Objects::nonNull)
                        .reduce(BigDecimal.ZERO, (a, b) -> a.add(b))
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

    @Cacheable(value = "dept_weak_subjects", key = "(#departmentId != null ? #departmentId : '0') + '-' + (#avgThreshold != null ? #avgThreshold : '50') + '-' + (#failureRateThreshold != null ? #failureRateThreshold : '0.3')")
    public List<Map<String, Object>> getWeakSubjects(Long departmentId, BigDecimal avgThreshold, Double failureRateThreshold) {
        Department dept = findDepartmentOrThrow(departmentId);
        Set<Long> studentIds = getStudentIdsUnderHod(dept);
        if (studentIds.isEmpty()) return Collections.emptyList();
        if (avgThreshold == null) avgThreshold = WEAK_AVG_THRESHOLD;
        if (failureRateThreshold == null) failureRateThreshold = WEAK_FAILURE_RATE_THRESHOLD;
        List<Marks> deptMarks = fetchMarksForStudentIds(studentIds);
        Map<Long, List<Marks>> bySubject = deptMarks.stream()
                .filter(m -> m != null && m.getSubject() != null && m.getSubject().getId() != null)
                .collect(Collectors.groupingBy(m -> m.getSubject().getId()));
        List<Map<String, Object>> weak = new ArrayList<>();
        for (Map.Entry<Long, List<Marks>> e : bySubject.entrySet()) {
            List<Marks> list = e.getValue();
            if (list == null || list.isEmpty()) continue;
            BigDecimal avg = list.stream()
                    .filter(m -> m != null && m.getTotalScore() != null)
                    .map(m -> m.getTotalScore())
                    .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));
            int count = (int) list.stream().filter(m -> m != null && m.getTotalScore() != null).count();
            if (count == 0) continue;
            avg = avg.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
            int failed = (int) list.stream().filter(m -> m != null && m.getGrade() != null && ("F".equalsIgnoreCase(m.getGrade()) || "AB".equalsIgnoreCase(m.getGrade()))).count();
            int graded = (int) list.stream().filter(m -> m != null && m.getGrade() != null && !m.getGrade().isEmpty()).count();
            double failRate = graded > 0 ? (double) failed / graded : 0;
            if (avg.compareTo(avgThreshold) < 0 || failRate >= failureRateThreshold) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("subjectId", e.getKey());
                String subjName = (list.get(0).getSubject() != null && list.get(0).getSubject().getSubjectName() != null)
                        ? list.get(0).getSubject().getSubjectName()
                        : "Subject " + e.getKey();
                m.put("subjectName", subjName);
                m.put("averageScore", avg);
                m.put("failureRate", BigDecimal.valueOf(failRate * 100).setScale(2, RoundingMode.HALF_UP));
                weak.add(m);
            }
        }
        return weak;
    }

    @Cacheable(value = "dept_trends", key = "(#departmentId != null ? #departmentId : '0') + '-' + (#by != null ? #by : 'semester')")
    public List<Map<String, Object>> getPerformanceTrends(Long departmentId, String by) {
        Department dept = findDepartmentOrThrow(departmentId);
        Set<Long> studentIds = getStudentIdsUnderHod(dept);
        if (studentIds.isEmpty()) return Collections.emptyList();
        List<Marks> deptMarks = fetchMarksForStudentIds(studentIds);
        if (deptMarks.isEmpty()) return Collections.emptyList();
        boolean byYear = "year".equalsIgnoreCase(by);
        Map<String, List<BigDecimal>> groupScores = new LinkedHashMap<>();
        for (Marks m : deptMarks) {
            if (m == null || m.getTotalScore() == null) continue;
            String key;
            if (byYear) {
                if (m.getStudent() == null || m.getStudent().getYear() == null) continue;
                key = String.valueOf(m.getStudent().getYear());
            } else {
                key = m.getSemester() != null ? "Sem " + m.getSemester() : "Sem N/A";
            }
            groupScores.computeIfAbsent(key, k -> new ArrayList<>()).add(m.getTotalScore());
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, List<BigDecimal>> e : groupScores.entrySet()) {
            BigDecimal avg = e.getValue().stream()
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, (a, b) -> a.add(b))
                    .divide(BigDecimal.valueOf(e.getValue().size()), 2, RoundingMode.HALF_UP);
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
        List<Map<String, Object>> ranked = new ArrayList<>(classPerf.size());
        int rank = 1;
        for (Map<String, Object> row : classPerf) {
            Map<String, Object> copy = new LinkedHashMap<>(row);
            copy.put("rank", rank);
            copy.put("attendanceRank", rank);
            rank++;
            ranked.add(copy);
        }
        return ranked;
    }

    public Map<String, Object> getStudentPerformance(Long departmentId, Long studentId) {
        findDepartmentOrThrow(departmentId);
        if (studentId == null) {
            throw new com.university.erp.util.ErpException.ResourceNotFoundException("Student not found");
        }
        Student student = studentRepository.findById(studentId).orElseThrow(() -> new com.university.erp.util.ErpException.ResourceNotFoundException("Student not found"));
        boolean isHandS = isHandSDepartment(departmentId);
        boolean canAccess = isHandS
                ? (student.getYear() != null && student.getYear() == 1)
                : (student.getDepartment() != null && departmentId.equals(student.getDepartment().getId()) && student.getYear() != null && student.getYear() >= 2);
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
        out.put("marks", marks != null ? marks.stream().filter(Objects::nonNull).map(m -> markToMap(m)).collect(Collectors.toList()) : Collections.emptyList());
        out.put("attendance", att != null ? att.stream().filter(Objects::nonNull).map(a -> {
            Map<String, Object> am = new LinkedHashMap<>();
            am.put("subjectId", a.getSubject() != null ? a.getSubject().getId() : null);
            am.put("percentage", a.getPercentage());
            am.put("attendedClasses", a.getAttendedClasses());
            am.put("totalClasses", a.getTotalClasses());
            return am;
        }).collect(Collectors.toList()) : Collections.emptyList());
        return out;
    }

    private Map<String, Object> markToMap(Marks m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("subjectId", (m.getSubject() != null) ? m.getSubject().getId() : null);
        map.put("subjectName", (m.getSubject() != null) ? m.getSubject().getSubjectName() : null);
        map.put("semester", m.getSemester());
        map.put("totalScore", m.getTotalScore());
        map.put("calculatedInternal", m.getCalculatedInternal());
        map.put("grade", m.getGrade());
        return map;
    }
}
