package com.university.erp.service;

import com.university.erp.entity.Parent;
import com.university.erp.entity.Student;
import com.university.erp.repository.ParentRepository;
import org.springframework.stereotype.Service;

@Service
public class ParentService {

    private final ParentRepository parentRepository;

    public ParentService(ParentRepository parentRepository) {
        this.parentRepository = parentRepository;
    }

    public Student getAssignedStudent(Long parentUserId) {
        Parent parent = parentRepository.findByUser_Id(parentUserId)
                .orElseThrow(() -> new RuntimeException("Parent profile not found"));
        return parent.getStudent();
    }
}
