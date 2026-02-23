package com.rit.digitaltwin.service;

import com.rit.digitaltwin.dto.GrowthPassportResponse;
import com.rit.digitaltwin.model.*;
import com.rit.digitaltwin.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CareerAnalyticsService {

    private final StudentRepository studentRepository;
    private final StudentSkillRepository skillRepository;
    private final StudentProjectRepository projectRepository;
    private final InternshipRepository internshipRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;
    private final CareerRecommendationRepository careerRecommendationRepository;
    private final NotificationService notificationService;

    public GrowthPassportResponse getGrowthPassport(Long studentId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        List<StudentSkill> skills = skillRepository.findByStudentId(studentId);
        List<StudentProject> projects = projectRepository.findByStudentId(studentId);
        List<Internship> internships = internshipRepository.findByStudentId(studentId);
        List<Attendance> attendances = attendanceRepository.findByStudentId(studentId);
        List<Marks> marks = marksRepository.findByStudentId(studentId);

        // Attendance Percentage
        long presentCount = attendances.stream()
                .filter(a -> "PRESENT".equals(a.getStatus()) || "ON_DUTY".equals(a.getStatus()))
                .count();
        double attendancePercent = attendances.isEmpty() ? 100.0 : ((double) presentCount / attendances.size()) * 100.0;

        // Internal Performance
        double avgInternal = marks.stream()
                .mapToDouble(m -> m.getInternalMarks() != null ? m.getInternalMarks() : 0)
                .average().orElse(0.0);

        // Radar chart indices (mock algorithms for now, based on counts and averages)
        double academicStrength = (student.getCurrentCgpa() != null ? student.getCurrentCgpa() : 0.0) * 10.0;
        double practicalSkills = Math.min(100.0,
                (projects.size() * 15.0) + (internships.size() * 20.0) + (skills.size() * 5.0));
        double attendanceConsistency = attendancePercent;
        double performanceImprovement = 75.0; // Dynamic calculation would require historical GPA trends

        double placementReadinessScore = (academicStrength * 0.4) + (practicalSkills * 0.4)
                + (attendanceConsistency * 0.2);

        return GrowthPassportResponse.builder()
                .currentCgpa(student.getCurrentCgpa())
                .attendancePercentage(attendancePercent)
                .internalPerformance(avgInternal)
                .placementReadinessScore(placementReadinessScore)
                .academicStrength(academicStrength)
                .practicalSkills(practicalSkills)
                .attendanceConsistency(attendanceConsistency)
                .performanceImprovement(performanceImprovement)
                .skills(skills.stream().map(StudentSkill::getSkillName).collect(Collectors.toList()))
                .projectsCompleted(projects.size())
                .internshipsCompleted(internships.size())
                .build();
    }

    public CareerRecommendation getOrGenerateCareerRecommendation(Long studentId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        Optional<CareerRecommendation> existing = careerRecommendationRepository.findByStudentId(studentId);

        if (existing.isPresent()) {
            return existing.get();
        }

        // AI Recommendation Logic (Deterministic for MVP)
        GrowthPassportResponse passport = getGrowthPassport(studentId);

        String domain = "Software Development";
        String certifications = "AWS Certified Developer, Oracle Java SE";
        String gaps = "Improve DSA and DBMS to increase probability.";
        double prob = 60.0 + (passport.getPlacementReadinessScore() * 0.35);

        if (passport.getAcademicStrength() > 85.0 && passport.getPracticalSkills() > 70.0) {
            domain = "Data Science & AI";
            certifications = "Google Cloud Professional Data Engineer";
            gaps = "Focus on Advanced Statistics and Linear Algebra.";
        } else if (passport.getPracticalSkills() > 80.0) {
            domain = "Full Stack Web Development";
            certifications = "Meta Front-End Developer Professional Certificate";
            gaps = "Learn modern frontend frameworks like React or Vue.";
        }

        CareerRecommendation recommendation = CareerRecommendation.builder()
                .student(student)
                .recommendedDomain(domain)
                .suggestedCertifications(certifications)
                .skillGapAnalysis(gaps)
                .placementProbability(Math.min(99.0, prob))
                .build();

        CareerRecommendation saved = careerRecommendationRepository.save(recommendation);

        // Notify user
        if (student.getUser() != null) {
            notificationService.sendToUser(
                    student.getUser().getUserId(),
                    "Career Path Suggested",
                    "Based on your profile, we recommend a career in " + domain + ".",
                    "INFO");
        }

        return saved;
    }
}
