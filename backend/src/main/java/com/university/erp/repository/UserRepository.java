package com.university.erp.repository;

import com.university.erp.entity.Role;
import com.university.erp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    long countByRole_RoleNameAndDepartment_Id(Role.UserRole roleName, Long departmentId);

    List<User> findByRole_RoleNameAndDepartment_Id(Role.UserRole roleName, Long departmentId);

    List<User> findByRole_RoleName(Role.UserRole roleName);

    java.util.Optional<User> findByLinkedStudent_Id(Long studentId);
    Optional<User> findByLinkedStudent_RegisterNo(String registerNo);
    Optional<User> findByLinkedStudent_StudentIdNumber(String studentIdNumber);
}
