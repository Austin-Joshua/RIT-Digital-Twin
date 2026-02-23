package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.Student;
import com.rit.digitaltwin.model.Subject;
import com.rit.digitaltwin.model.SubjectRegistration;
import com.rit.digitaltwin.repository.StudentRepository;
import com.rit.digitaltwin.repository.SubjectRepository;
import com.rit.digitaltwin.repository.SubjectRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectRegistrationService {

    private final SubjectRegistrationRepository registrationRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    public List<SubjectRegistration> getRegistrationsForStudent(Long studentId) {
        return registrationRepository.findByStudentId(studentId);
    }

    @Transactional
    public SubjectRegistration createRegistration(Long studentId, Long subjectId) {
        // Concurrency control: We could use pessemistic locking on Subject if it had a
        // capacity field.
        // For now, simple insert handling.

        if (registrationRepository.findByStudentIdAndSubjectId(studentId, subjectId).isPresent()) {
            throw new IllegalStateException("Student is already registered for this subject.");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        SubjectRegistration registration = SubjectRegistration.builder()
                .student(student)
                .subject(subject)
                .status(SubjectRegistration.RegistrationStatus.REGISTERED)
                .build();

        return registrationRepository.save(registration);
    }

    @Transactional
    public void deleteRegistration(Long registrationId) {
        registrationRepository.deleteById(registrationId);
    }
}
