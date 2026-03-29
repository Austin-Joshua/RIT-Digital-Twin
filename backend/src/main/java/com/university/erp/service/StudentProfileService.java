package com.university.erp.service;

import com.university.erp.model.Student;
import com.university.erp.repository.StudentRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class StudentProfileService {

    private final StudentRepository studentRepository;

    public StudentProfileService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Cacheable(cacheNames = "studentProfiles", key = "#userId")
    public Student getByUserId(Long userId) {
        return studentRepository.findByUser_Id(userId)
                .orElseThrow(() -> new com.university.erp.util.ErpException.ResourceNotFoundException(
                        "Student profile not found"));
    }

    @Cacheable(cacheNames = "studentProfiles", key = "'id:' + #studentId")
    public Student getByStudentId(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new com.university.erp.util.ErpException.ResourceNotFoundException(
                        "Student not found"));
    }
}
