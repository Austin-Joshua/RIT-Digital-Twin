package com.university.erp.controller;

import com.university.erp.model.ResearchPublication;
import com.university.erp.model.User;
import com.university.erp.repository.ResearchPublicationRepository;
import com.university.erp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/research/publications")
public class ResearchPublicationController {

    private final ResearchPublicationRepository publicationRepository;
    private final UserRepository userRepository;

    public ResearchPublicationController(
            ResearchPublicationRepository publicationRepository,
            UserRepository userRepository) {
        this.publicationRepository = publicationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<ResearchPublication>> getAllPublications() {
        return ResponseEntity.ok(publicationRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FACULTY', 'HOD', 'ADMIN')")
    public ResponseEntity<ResearchPublication> createPublication(
            @RequestBody Map<String, Object> payload,
            Authentication auth) {

        String title = String.valueOf(payload.getOrDefault("title", "Research Publication"));
        String type = String.valueOf(payload.getOrDefault("type", "Journal"));
        String publisher = String.valueOf(payload.getOrDefault("publisher", ""));
        String date = String.valueOf(payload.getOrDefault("date", payload.getOrDefault("publicationDate", "Recent")));
        String status = String.valueOf(payload.getOrDefault("status", "Published"));
        Integer citations = 0;
        try {
            if (payload.get("citations") != null) {
                citations = Integer.parseInt(String.valueOf(payload.get("citations")));
            }
        } catch (Exception ignored) {}

        String abstractText = String.valueOf(payload.getOrDefault("abstract", payload.getOrDefault("abstractText", "")));
        String authors = String.valueOf(payload.getOrDefault("authors", ""));
        String doi = String.valueOf(payload.getOrDefault("doi", ""));

        User user = null;
        if (auth != null) {
            user = userRepository.findByUsername(auth.getName()).orElse(null);
        }

        ResearchPublication pub = ResearchPublication.builder()
                .title(title)
                .type(type)
                .publisher(publisher)
                .publicationDate(date)
                .status(status)
                .citations(citations)
                .abstractText(abstractText)
                .authors(authors)
                .doi(doi)
                .user(user)
                .build();

        return ResponseEntity.ok(publicationRepository.save(pub));
    }
}
