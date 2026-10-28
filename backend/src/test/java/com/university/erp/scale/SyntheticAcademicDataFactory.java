package com.university.erp.scale;

import com.university.erp.model.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Isolated synthetic data generator for enterprise load testing and performance validation.
 * Used strictly in test environments — never in production.
 */
public class SyntheticAcademicDataFactory {

    public static final List<String> DEPARTMENTS = List.of("CSE", "CSBS", "AIML", "CCE", "ECE", "MECH", "AIDS", "VLSI");
    public static final List<String> ACADEMIC_YEARS = List.of("2023-2024", "2024-2025", "2025-2026", "2026-2027");
    public static final List<String> SECTIONS = List.of("A", "B", "C");

    public static List<Department> createDepartments() {
        List<Department> list = new ArrayList<>();
        long id = 1;
        for (String code : DEPARTMENTS) {
            Department d = Department.builder()
                    .id(id++)
                    .code(code)
                    .deptName("B.E. " + code)
                    .build();
            list.add(d);
        }
        return list;
    }

    public static List<AcademicYear> createAcademicYears() {
        List<AcademicYear> list = new ArrayList<>();
        long id = 1;
        for (String year : ACADEMIC_YEARS) {
            AcademicYear ay = AcademicYear.builder()
                    .id(id++)
                    .yearCode(year)
                    .isCurrent("2024-2025".equals(year))
                    .status("2023-2024".equals(year) ? "ARCHIVED" : "ACTIVE")
                    .build();
            list.add(ay);
        }
        return list;
    }

    public static List<Student> createStudents(Department dept, int countPerYear, String batch) {
        List<Student> students = new ArrayList<>();
        long idGen = dept.getId() * 10000L;
        for (int year = 1; year <= 4; year++) {
            for (int i = 1; i <= countPerYear; i++) {
                String section = SECTIONS.get((i - 1) % SECTIONS.size());
                String regNo = String.format("2117%02d%d%04d", dept.getId(), year, i);
                User user = User.builder()
                        .userId(idGen)
                        .username(regNo)
                        .email(regNo.toLowerCase() + "@ritchennai.edu.in")
                        .firstName("Student" + i)
                        .lastName(dept.getCode())
                        .build();

                Student s = Student.builder()
                        .id(idGen++)
                        .user(user)
                        .studentIdNumber(regNo)
                        .registerNo(regNo)
                        .studentName("Student " + i + " " + dept.getCode())
                        .year(year)
                        .section(dept.getCode() + "-" + section)
                        .batch(batch)
                        .department(dept)
                        .currentSemester(year * 2)
                        .currentCgpa(BigDecimal.valueOf(6.5 + (i % 35) * 0.1).setScale(2, RoundingMode.HALF_UP))
                        .status("active")
                        .build();
                students.add(s);
            }
        }
        return students;
    }

    public static List<Marks> createMarksForStudents(List<Student> students, Subject subject, AcademicYear ay) {
        List<Marks> marks = new ArrayList<>();
        long id = 1;
        for (Student s : students) {
            BigDecimal total = BigDecimal.valueOf(45 + (s.getId().hashCode() % 50));
            String grade = total.compareTo(new BigDecimal("50")) < 0 ? "F" : total.compareTo(new BigDecimal("75")) >= 0 ? "A" : "B";
            Marks m = Marks.builder()
                    .id(id++)
                    .student(s)
                    .subject(subject)
                    .academicYear(ay)
                    .semester(s.getYear() * 2)
                    .totalScore(total)
                    .calculatedInternal(total.multiply(new BigDecimal("0.4")).setScale(2, RoundingMode.HALF_UP))
                    .grade(grade)
                    .build();
            marks.add(m);
        }
        return marks;
    }
}
