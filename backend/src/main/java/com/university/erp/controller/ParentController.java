package com.university.erp.controller;

import com.university.erp.entity.Student;
import com.university.erp.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parent")
public class ParentController {

    @GetMapping("/students")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<List<Map<String, Object>>> linkedStudents() {
        User user = currentUser();
        Student linked = user.getLinkedStudent();
        if (linked == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(List.of(toParentStudentCard(linked)));
    }

    private Map<String, Object> toParentStudentCard(Student s) {
        Map<String, Object> userCard = new LinkedHashMap<>();
        userCard.put("firstName", s.getUser() != null ? s.getUser().getFirstName() : s.getStudentName());
        userCard.put("lastName", s.getUser() != null ? s.getUser().getLastName() : "");

        Map<String, Object> card = new LinkedHashMap<>();
        card.put("id", s.getId());
        card.put("user", userCard);
        card.put("studentIdNumber", s.getStudentIdNumber());
        card.put("currentCgpa", s.getCurrentCgpa() != null ? s.getCurrentCgpa() : BigDecimal.ZERO);
        return card;
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }
}
