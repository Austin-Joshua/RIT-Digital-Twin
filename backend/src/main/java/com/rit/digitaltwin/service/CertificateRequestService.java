package com.rit.digitaltwin.service;

import com.rit.digitaltwin.model.CertificateRequest;
import com.rit.digitaltwin.model.Student;
import com.rit.digitaltwin.repository.CertificateRequestRepository;
import com.rit.digitaltwin.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CertificateRequestService {

    private final CertificateRequestRepository certificateRepository;
    private final StudentRepository studentRepository;

    public List<CertificateRequest> getRequestsByStudent(Long studentId) {
        return certificateRepository.findByStudentStudentId(studentId);
    }

    public List<CertificateRequest> getPendingRequests() {
        return certificateRepository.findByStatus(CertificateRequest.RequestStatus.PENDING);
    }

    @Transactional
    public CertificateRequest createRequest(Long studentId, CertificateRequest.CertificateType type) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        CertificateRequest request = CertificateRequest.builder()
                .student(student)
                .type(type)
                .status(CertificateRequest.RequestStatus.PENDING)
                .build();

        return certificateRepository.save(request);
    }

    @Transactional
    public CertificateRequest approveRequestAndGeneratePdf(Long requestId) {
        CertificateRequest request = certificateRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(CertificateRequest.RequestStatus.APPROVED);

        try (org.apache.pdfbox.pdmodel.PDDocument document = new org.apache.pdfbox.pdmodel.PDDocument()) {
            org.apache.pdfbox.pdmodel.PDPage page = new org.apache.pdfbox.pdmodel.PDPage();
            document.addPage(page);

            try (org.apache.pdfbox.pdmodel.PDPageContentStream contentStream = new org.apache.pdfbox.pdmodel.PDPageContentStream(
                    document, page)) {
                contentStream.beginText();
                contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA_BOLD, 24);
                contentStream.newLineAtOffset(100, 700);
                contentStream.showText("CERTIFICATE OF " + request.getType().name());
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA, 16);
                contentStream.newLineAtOffset(100, 600);
                contentStream.showText("This is to certify that " + request.getStudent().getUser().getFirstName() + " "
                        + request.getStudent().getUser().getLastName());
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA, 16);
                contentStream.newLineAtOffset(100, 550);
                contentStream.showText("has been granted this " + request.getType().name() + " certificate.");
                contentStream.endText();
            }

            java.io.File dir = new java.io.File("downloads/certificates");
            if (!dir.exists()) {
                dir.mkdirs();
            }
            String fileName = "cert_" + requestId + ".pdf";
            document.save(dir.getAbsolutePath() + "/" + fileName);
            request.setFilePath("/downloads/certificates/" + fileName);
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }

        request.setStatus(CertificateRequest.RequestStatus.GENERATED);

        return certificateRepository.save(request);
    }

    @Transactional
    public CertificateRequest rejectRequest(Long requestId) {
        CertificateRequest request = certificateRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(CertificateRequest.RequestStatus.REJECTED);
        return certificateRepository.save(request);
    }
}
