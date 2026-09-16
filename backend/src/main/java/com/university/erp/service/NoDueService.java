package com.university.erp.service;

import com.university.erp.model.*;
import com.university.erp.repository.*;
import com.university.erp.util.ErpException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class NoDueService {

    private final NoDueRequestRepository noDueRequestRepository;
    private final ClearanceDefinitionRepository clearanceDefinitionRepository;
    private final StudentRepository studentRepository;
    private final AuditLogRepository auditLogRepository;

    public List<Map<String, Object>> getStudentClearances(User studentUser) {
        Student student = studentRepository.findByUser_Id(studentUser.getId())
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student profile not found"));

        List<ClearanceDefinition> definitions = clearanceDefinitionRepository.findByActiveTrueOrderByDisplayOrderAsc();
        List<NoDueRequest> existingRequests = noDueRequestRepository.findByStudent_Id(student.getId());

        Map<String, NoDueRequest> requestByCode = new HashMap<>();
        Map<String, NoDueRequest> requestByName = new HashMap<>();
        for (NoDueRequest r : existingRequests) {
            if (r.getClearanceDefinition() != null) {
                requestByCode.put(r.getClearanceDefinition().getCode(), r);
            }
            if (r.getClearanceType() != null) {
                requestByName.put(r.getClearanceType().toLowerCase(Locale.ROOT), r);
            }
        }

        List<Map<String, Object>> response = new ArrayList<>();
        for (ClearanceDefinition def : definitions) {
            NoDueRequest req = requestByCode.get(def.getCode());
            if (req == null) {
                req = requestByName.get(def.getName().toLowerCase(Locale.ROOT));
            }

            Map<String, Object> item = new LinkedHashMap<>();
            // ZERO synthetic IDs: if not requested or not persisted, id is null
            item.put("id", req != null ? req.getId() : null);
            item.put("clearanceDefinitionId", def.getId());
            item.put("name", def.getName());
            item.put("code", def.getCode());
            item.put("authorityType", def.getAuthorityType());
            item.put("description", def.getDescription());

            String officer = "Pending Request";
            if (req != null) {
                if (req.getApprovedBy() != null) {
                    officer = req.getApprovedBy().getFirstName() + " " + req.getApprovedBy().getLastName();
                } else if (req.getRejectedBy() != null) {
                    officer = req.getRejectedBy().getFirstName() + " " + req.getRejectedBy().getLastName();
                } else if ("PENDING".equalsIgnoreCase(req.getStatus())) {
                    officer = "Under Verification";
                }
            }
            item.put("faculty", officer);
            item.put("status", req != null ? req.getStatus().toUpperCase(Locale.ROOT) : "NOT_REQUESTED");
            item.put("remarks", req != null && req.getRemarks() != null ? req.getRemarks() : "");
            item.put("requestedAt", req != null ? req.getRequestedAt() : null);
            response.add(item);
        }

        return response;
    }

    @Transactional
    public Map<String, Object> submitRequest(User studentUser, Map<String, Object> payload) {
        Student student = studentRepository.findByUser_Id(studentUser.getId())
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Student profile not found"));

        ClearanceDefinition definition = null;
        if (payload.get("clearanceDefinitionId") != null) {
            Long defId = Long.valueOf(String.valueOf(payload.get("clearanceDefinitionId")));
            definition = clearanceDefinitionRepository.findById(defId)
                    .orElseThrow(() -> new ErpException.ResourceNotFoundException("Clearance definition not found"));
        } else if (payload.get("clearanceType") != null) {
            String typeName = String.valueOf(payload.get("clearanceType")).trim();
            definition = clearanceDefinitionRepository.findByNameIgnoreCase(typeName)
                    .or(() -> clearanceDefinitionRepository.findByCodeIgnoreCase(typeName))
                    .orElse(null);
        }

        String clearanceTypeName = definition != null ? definition.getName() : String.valueOf(payload.get("clearanceType"));
        if (clearanceTypeName == null || clearanceTypeName.isBlank()) {
            throw new ErpException.BadRequestException("Clearance type or definition ID is required.");
        }

        Optional<NoDueRequest> existingOpt = definition != null
                ? noDueRequestRepository.findByStudent_IdAndClearanceDefinition_Id(student.getId(), definition.getId())
                : noDueRequestRepository.findByStudent_IdAndClearanceTypeIgnoreCase(student.getId(), clearanceTypeName);

        if (existingOpt.isPresent()) {
            NoDueRequest existing = existingOpt.get();
            if ("PENDING".equalsIgnoreCase(existing.getStatus())) {
                throw new ErpException.ConflictException("A clearance request for '" + clearanceTypeName + "' is already currently pending.");
            }
            if ("APPROVED".equalsIgnoreCase(existing.getStatus())) {
                throw new ErpException.ConflictException("Clearance for '" + clearanceTypeName + "' has already been approved.");
            }
        }

        NoDueRequest request;
        if (existingOpt.isPresent()) {
            request = existingOpt.get();
        } else {
            request = NoDueRequest.builder()
                    .student(student)
                    .clearanceDefinition(definition)
                    .clearanceType(clearanceTypeName)
                    .build();
        }

        request.setClearanceDefinition(definition);
        request.setClearanceType(clearanceTypeName);
        request.setPreviousStatus(request.getStatus());
        request.setStatus("PENDING");
        request.setRequestedAt(LocalDateTime.now());
        request.setApprovedAt(null);
        request.setApprovedBy(null);
        request.setRejectedAt(null);
        request.setRejectedBy(null);

        NoDueRequest saved = noDueRequestRepository.save(request);

        return Map.of(
                "success", true,
                "message", "No Due request submitted for " + clearanceTypeName,
                "requestId", saved.getId(),
                "status", "PENDING"
        );
    }

    public List<Map<String, Object>> getScopedPendingRequests(User approver) {
        Role.UserRole role = approver.getRole() != null ? approver.getRole().getRoleName() : null;
        boolean isAdmin = role == Role.UserRole.ADMIN;
        boolean isHod = role == Role.UserRole.HOD;

        List<NoDueRequest> requests;
        if (isAdmin) {
            requests = noDueRequestRepository.findByStatusIgnoreCase("PENDING");
        } else if (isHod) {
            Long deptId = getDepartmentId(approver);
            if (deptId != null) {
                requests = noDueRequestRepository.findByStudent_Department_IdAndStatusIgnoreCase(deptId, "PENDING");
            } else {
                requests = Collections.emptyList();
            }
        } else {
            // Faculty approvers
            Long deptId = getDepartmentId(approver);
            if (deptId != null) {
                requests = noDueRequestRepository.findByStudent_Department_IdAndStatusIgnoreCase(deptId, "PENDING");
            } else {
                requests = Collections.emptyList();
            }
        }

        List<Map<String, Object>> response = new ArrayList<>();
        for (NoDueRequest r : requests) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", r.getId());
            map.put("studentId", r.getStudent().getId());
            map.put("studentName", r.getStudent().getStudentName());
            map.put("reg", r.getStudent().getRegisterNo());
            map.put("dept", r.getStudent().getDepartment() != null ? r.getStudent().getDepartment().getDeptName() : "");
            map.put("clearanceType", r.getClearanceType());
            map.put("clearanceDefinitionId", r.getClearanceDefinition() != null ? r.getClearanceDefinition().getId() : null);
            map.put("status", r.getStatus().toUpperCase(Locale.ROOT));
            map.put("remarks", r.getRemarks() != null ? r.getRemarks() : "");
            map.put("requestedAt", r.getRequestedAt());
            response.add(map);
        }
        return response;
    }

    @Transactional
    public Map<String, Object> processRequest(Long id, Map<String, String> payload, User approver, String ipAddress) {
        NoDueRequest request = noDueRequestRepository.findById(id)
                .orElseThrow(() -> new ErpException.ResourceNotFoundException("Clearance request not found"));

        Role.UserRole role = approver.getRole() != null ? approver.getRole().getRoleName() : null;
        boolean isAdmin = role == Role.UserRole.ADMIN;

        // Resource authorization check
        if (!isAdmin) {
            Long deptId = getDepartmentId(approver);
            if (deptId != null && request.getStudent().getDepartment() != null) {
                if (!deptId.equals(request.getStudent().getDepartment().getId())) {
                    throw new ErpException.UnauthorizedException("Access Denied: You can only process clearance requests within your authorized department.");
                }
            } else if (deptId == null) {
                throw new ErpException.UnauthorizedException("Access Denied: No departmental authorization found for approver.");
            }
        }

        // State Machine validation
        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new ErpException.InvalidOperationException("Invalid state transition: Cannot process clearance that is already " + request.getStatus());
        }

        String targetStatus = payload.getOrDefault("status", "APPROVED").toUpperCase(Locale.ROOT);
        if (!"APPROVED".equals(targetStatus) && !"REJECTED".equals(targetStatus)) {
            throw new ErpException.BadRequestException("Invalid clearance status transition. Allowed: APPROVED, REJECTED.");
        }

        String remarks = payload.getOrDefault("remarks", "APPROVED".equals(targetStatus) ? "Clearance granted." : "Clearance withheld.");

        request.setPreviousStatus(request.getStatus());
        request.setStatus(targetStatus);
        request.setRemarks(remarks);
        request.setIpAddress(ipAddress);

        if ("APPROVED".equals(targetStatus)) {
            request.setApprovedAt(LocalDateTime.now());
            request.setApprovedBy(approver);
            request.setRejectedAt(null);
            request.setRejectedBy(null);
        } else {
            request.setRejectedAt(LocalDateTime.now());
            request.setRejectedBy(approver);
            request.setApprovedAt(null);
            request.setApprovedBy(null);
        }

        noDueRequestRepository.save(request);

        // Record tamper-evident audit log
        auditLogRepository.save(AuditLog.builder()
                .actor(approver)
                .action("NO_DUE_PROCESS")
                .actionTime(LocalDateTime.now())
                .details(String.format("Processed Request ID: %d for Student: %s. New Status: %s. Remarks: %s",
                        id, request.getStudent().getRegisterNo(), targetStatus, remarks))
                .ipAddress(ipAddress)
                .build());

        return Map.of("success", true, "status", targetStatus, "requestId", id);
    }

    private Long getDepartmentId(User user) {
        if (user.getDepartment() != null) {
            return user.getDepartment().getId();
        }
        return null;
    }
}
