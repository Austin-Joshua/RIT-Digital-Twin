package com.university.erp.controller;

import com.university.erp.entity.Marks;
import com.university.erp.entity.User;
import com.university.erp.entity.Role;
import com.university.erp.service.AcademicService;
import com.university.erp.service.StudentProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/academic")
public class AcademicController {

    private final AcademicService academicService;
    private final StudentProfileService studentProfileService;

    public AcademicController(AcademicService academicService, StudentProfileService studentProfileService) {
        this.academicService = academicService;
        this.studentProfileService = studentProfileService;
    }

    @PostMapping("/marks/{studentId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<String> enterMarks(@PathVariable @org.springframework.lang.NonNull Long studentId,
            @RequestBody @org.springframework.lang.NonNull Marks marks) {
        java.util.Objects.requireNonNull(studentId, "studentId must not be null");
        java.util.Objects.requireNonNull(marks, "marks payload must not be null");
        academicService.enterMarks(studentId, marks);
        return ResponseEntity.ok("Marks entered successfully");
    }

    @GetMapping("/marks/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT','FACULTY','ADMIN','HOD','PARENT')")
    public ResponseEntity<List<Marks>> getStudentMarks(
            @PathVariable @org.springframework.lang.NonNull Long studentId,
            @RequestParam(name = "page", required = false) Integer page,
            @RequestParam(name = "size", required = false) Integer size) {
        Objects.requireNonNull(studentId, "studentId must not be null");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Objects.requireNonNull(authentication, "authentication must not be null");
        User currentUser = (User) authentication.getPrincipal();
        Objects.requireNonNull(currentUser, "user principal must not be null");
        Role.UserRole role = currentUser.getRole().getRoleName();

        com.university.erp.entity.Student targetStudent = studentProfileService.getByStudentId(studentId);

        // Student can only access their own marks
        if (role == Role.UserRole.STUDENT) {
            com.university.erp.entity.Student self = studentProfileService.getByUserId(currentUser.getId());
            if (!self.getId().equals(studentId)) {
                throw new AccessDeniedException("Students can only view their own marks.");
            }
        }

        // Parents are strictly view-only; access control to specific wards can be
        // extended
        // via an explicit parent-student mapping if introduced later.

        // Faculty and HOD are limited to their department where available
        if (role == Role.UserRole.FACULTY || role == Role.UserRole.HOD) {
            if (currentUser.getDepartment() != null && targetStudent.getDepartment() != null
                    && !currentUser.getDepartment().getId().equals(targetStudent.getDepartment().getId())) {
                throw new AccessDeniedException("Faculty/HOD can only view students within their department.");
            }
        }

        // ADMIN is allowed by role guard alone

        List<Marks> marks;
        if (page != null && size != null) {
            marks = academicService.getStudentMarksPaged(studentId, page, size);
        } else {
            marks = academicService.getStudentMarks(studentId);
        }

        return ResponseEntity.ok(marks);
    }
}
