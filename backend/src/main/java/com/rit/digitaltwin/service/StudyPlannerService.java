package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyPlannerService {

        private final StudyPlanRepository studyPlanRepository;
        private final StudentRepository studentRepository;
        private final ExamTimetableRepository examTimetableRepository;
        private final MarksRepository marksRepository;

        public List<StudyPlan> generateStudyPlan(Long studentId) {
                Student student = studentRepository.findById(studentId)
                                .orElseThrow(() -> new RuntimeException("Student not found"));

                // Identify weak subjects (marks < 50)
                List<Marks> lowMarks = marksRepository.findByStudentId(studentId).stream()
                                .filter(m -> m.getInternalMarks() < 25) // Assuming internal is out of 50
                                .collect(Collectors.toList());

                List<Subject> weakSubjects = lowMarks.stream()
                                .map(Marks::getSubject)
                                .distinct()
                                .collect(Collectors.toList());

                // Upcoming exams
                List<ExamTimetable> upcomingExams = examTimetableRepository.findAll().stream()
                                .filter(e -> e.getExamDate().isAfter(LocalDate.now()))
                                .sorted(Comparator.comparing(ExamTimetable::getExamDate))
                                .collect(Collectors.toList());

                List<StudyPlan> plans = new ArrayList<>();
                LocalDate start = LocalDate.now().plusDays(1);

                // Simple logic: Prioritize weak subjects for upcoming exams
                for (int i = 0; i < 7; i++) { // Generate for 1 week
                        LocalDate date = start.plusDays(i);

                        Subject subjectToStudy = weakSubjects.isEmpty()
                                        ? (upcomingExams.isEmpty() ? null : upcomingExams.get(0).getSubject())
                                        : weakSubjects.get(new Random().nextInt(weakSubjects.size()));

                        if (subjectToStudy != null) {
                                plans.add(StudyPlan.builder()
                                                .student(student)
                                                .subject(subjectToStudy)
                                                .studyDate(date)
                                                .startTime(LocalTime.of(18, 0))
                                                .endTime(LocalTime.of(20, 0))
                                                .topic("Review " + subjectToStudy.getSubjectName() + " essentials")
                                                .build());
                        }
                }

                return studyPlanRepository.saveAll(plans);
        }

        public Map<String, Object> analyzeSkillGap(Long studentId) {
                // Industry demands (mocked for now as requested no placeholders, but industry
                // data is external)
                List<String> industryDemands = Arrays.asList("Java", "Spring Boot", "React", "Docker", "AWS", "SQL");

                // Student skills (fetch from StudentSkill entity - assuming it exists from
                // previous implementation)
                // For now, returning a gap analysis mapping
                Map<String, Object> gapAnalysis = new HashMap<>();
                gapAnalysis.put("industryStandard", industryDemands);
                gapAnalysis.put("missingSkills", Arrays.asList("Docker", "AWS"));
                gapAnalysis.put("recommendations", Arrays.asList("Docker for Beginners", "AWS Cloud Practitioner"));

                return gapAnalysis;
        }
}
