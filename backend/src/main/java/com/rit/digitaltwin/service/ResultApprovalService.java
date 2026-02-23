package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.Department;
import com.rit.digitaltwin.model.ResultApproval;
import com.rit.digitaltwin.model.User;
import com.rit.digitaltwin.repository.DepartmentRepository;
import com.rit.digitaltwin.repository.ResultApprovalRepository;
import com.rit.digitaltwin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResultApprovalService {

    private final ResultApprovalRepository approvalRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<ResultApproval> getApprovalsByDepartment(Long departmentId, Integer semester) {
        return approvalRepository.findByDepartmentIdAndSemester(departmentId, semester);
    }

    @Transactional
    public ResultApproval uploadMarksForApproval(Long departmentId, Integer semester, String facultyEmail) {
        Department dept = departmentRepository.findById(departmentId).orElseThrow();
        User faculty = userRepository.findByEmail(facultyEmail).orElseThrow();

        ResultApproval approval = ResultApproval.builder()
                .department(dept)
                .semester(semester)
                .status(ResultApproval.ApprovalStatus.PENDING_APPROVAL)
                .uploadedBy(faculty)
                .build();

        return approvalRepository.save(approval);
    }

    @Transactional
    public ResultApproval publishResults(Long approvalId, String adminEmail) {
        ResultApproval approval = approvalRepository.findById(approvalId).orElseThrow();
        User admin = userRepository.findByEmail(adminEmail).orElseThrow();

        approval.setStatus(ResultApproval.ApprovalStatus.PUBLISHED);
        approval.setApprovedBy(admin);

        // Broadcast over WebSocket that results are published
        messagingTemplate.convertAndSend("/topic/global",
                "Results have been published for " + approval.getDepartment().getDeptName() + " Semester "
                        + approval.getSemester());

        return approvalRepository.save(approval);
    }
}
