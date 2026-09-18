package com.university.erp.service;

import com.university.erp.model.Parent;
import com.university.erp.model.Role;
import com.university.erp.model.Student;
import com.university.erp.model.User;
import com.university.erp.repository.ParentRepository;
import com.university.erp.repository.StudentRepository;
import com.university.erp.repository.UserRepository;
import com.university.erp.security.LoginCredentials;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Restores missing class and mock login identities. A password that was already
 * changed, or that already matches the known secret, is not rewritten.
 */
@Service
@Slf4j
public class CampusCredentialAlignment {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;

    public CampusCredentialAlignment(UserRepository userRepository, StudentRepository studentRepository,
                                     ParentRepository parentRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.parentRepository = parentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void alignClassAccounts() {
        int students = 0;
        int parents = 0;
        for (Student student : studentRepository.findAll()) {
            if (!LoginCredentials.classRegister(student.getRegisterNo())) {
                continue;
            }
            if (alignStudent(student)) {
                students++;
            }
            if (alignParent(student)) {
                parents++;
            }
        }
        log.info("Class login identities checked. Students updated {}, parents updated {}. Secrets are not logged.",
                students, parents);
    }

    @Transactional
    public void alignMockStaffAccounts() {
        int updated = 0;
        for (User user : userRepository.findAll()) {
            if (user.getRole() == null || user.getRole().getRoleName() == null) {
                continue;
            }
            Role.UserRole role = user.getRole().getRoleName();
            if (role == Role.UserRole.STUDENT || role == Role.UserRole.PARENT) {
                continue;
            }
            if (isDemo(user)) {
                continue;
            }
            if (alignStaff(user)) {
                updated++;
            }
        }
        log.info("Mock staff login identities checked. Accounts updated {}. Secrets are not logged.", updated);
    }

    private boolean alignStudent(Student student) {
        User user = student.getUser();
        if (user == null || isDemo(user)) {
            return false;
        }
        boolean changed = false;
        String registerNo = student.getRegisterNo();
        if (userRepository.findByUsername(registerNo).isEmpty() || registerNo.equals(user.getUsername())) {
            if (!registerNo.equals(user.getUsername())) {
                user.setUsername(registerNo);
                changed = true;
            }
        }
        String email = LoginCredentials.collegeEmail(registerNo, user.getFirstName() != null ? user.getFirstName() : student.getStudentName());
        if (canUseEmail(user, email) && !email.equalsIgnoreCase(user.getEmail())) {
            user.setEmail(email);
            student.setEmail(email);
            changed = true;
        }
        String phone = student.getPhone() == null || student.getPhone().isBlank()
                ? LoginCredentials.studentPhone(registerNo)
                : student.getPhone();
        if (!phone.equals(student.getPhone())) {
            student.setPhone(phone);
            changed = true;
        }
        if (user.getPhone() == null || user.getPhone().isBlank()) {
            user.setPhone(phone);
            changed = true;
        }
        changed = applyPassword(user, LoginCredentials.studentPassword(registerNo)) || changed;
        if (changed) {
            userRepository.save(user);
            studentRepository.save(student);
        }
        return changed;
    }

    private boolean alignParent(Student student) {
        String registerNo = student.getRegisterNo();
        User parentUser = userRepository.findByUsername(LoginCredentials.parentUsername(registerNo)).orElse(null);
        if (parentUser == null || isDemo(parentUser)) {
            return false;
        }
        boolean changed = false;
        String email = LoginCredentials.parentEmail(registerNo);
        if (canUseEmail(parentUser, email) && !email.equalsIgnoreCase(parentUser.getEmail())) {
            parentUser.setEmail(email);
            changed = true;
        }
        Parent parent = parentRepository.findByUser_Id(parentUser.getId()).orElse(null);
        String phone = parentUser.getPhone();
        if (phone == null || phone.isBlank()) {
            if (parent != null && parent.getContactInfo() != null && parent.getContactInfo().matches("^\\d{10}$")) {
                phone = parent.getContactInfo();
            } else {
                phone = LoginCredentials.parentPhone(registerNo);
            }
            parentUser.setPhone(phone);
            changed = true;
        }
        if (parent != null && (parent.getContactInfo() == null || parent.getContactInfo().isBlank())) {
            parent.setContactInfo(phone);
            parentRepository.save(parent);
            changed = true;
        }
        parentUser.setLinkedStudent(student);
        changed = applyPassword(parentUser, LoginCredentials.STAFF_MOCK_PASSWORD) || changed;
        if (changed) {
            userRepository.save(parentUser);
        }
        return changed;
    }

    private boolean alignStaff(User user) {
        boolean changed = false;
        if (user.getPhone() == null || user.getPhone().isBlank()) {
            user.setPhone(LoginCredentials.staffPhone(user.getId() == null ? 0 : user.getId()));
            changed = true;
        }
        changed = applyPassword(user, LoginCredentials.STAFF_MOCK_PASSWORD) || changed;
        if (changed) {
            userRepository.save(user);
        }
        return changed;
    }

    private boolean applyPassword(User user, String password) {
        if (user.getLastPasswordChange() != null) {
            return false;
        }
        if (user.getPassword() != null && passwordEncoder.matches(password, user.getPassword())) {
            return false;
        }
        user.setPassword(passwordEncoder.encode(password));
        user.setMustChangePassword(false);
        user.setFailedLoginAttempts(0);
        user.setLockUntil(null);
        if ("locked".equalsIgnoreCase(user.getAccountStatus())) {
            user.setAccountStatus("active");
        }
        return true;
    }

    private boolean canUseEmail(User user, String email) {
        return userRepository.findByEmail(email)
                .map(existing -> existing.getId() != null && existing.getId().equals(user.getId()))
                .orElse(true);
    }

    private static boolean isDemo(User user) {
        String username = user.getUsername() == null ? "" : user.getUsername();
        String email = user.getEmail() == null ? "" : user.getEmail();
        return username.startsWith("DEMO-") || email.endsWith("@ritdigitaltwin.demo");
    }
}
