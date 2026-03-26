package com.university.erp.service;

import com.university.erp.entity.*;
import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlacementService {

    private final CompanyRepository companyRepository;
    private final PlacementOpportunityRepository opportunityRepository;
    private final PlacementApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;

    public List<PlacementOpportunity> getOpenOpportunities() {
        return opportunityRepository.findByStatus("Open");
    }

    @Transactional
    public PlacementApplication applyForOpportunity(Long studentId, Long opportunityId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        PlacementOpportunity opt = opportunityRepository.findById(opportunityId).orElseThrow();

        if (applicationRepository.findByStudent_Id(studentId).stream()
                .anyMatch(a -> a.getOpportunity().getId().equals(opportunityId))) {
            throw new RuntimeException("Already applied");
        }

        PlacementApplication app = PlacementApplication.builder()
                .student(student)
                .opportunity(opt)
                .appliedAt(LocalDateTime.now())
                .status("Applied")
                .build();

        return applicationRepository.save(app);
    }

    @Transactional
    public Company createCompany(Company company) {
        return companyRepository.save(company);
    }

    @Transactional
    public PlacementOpportunity publishOpportunity(PlacementOpportunity opportunity) {
        opportunity.setStatus("Open");
        return opportunityRepository.save(opportunity);
    }
}
