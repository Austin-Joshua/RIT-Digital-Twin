package com.rit.digitaltwin.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "research_publications")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ResearchPublication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @Column(nullable = false)
    private String title;

    private String journal;

    @Column(name = "publication_date")
    private LocalDate publicationDate;

    private String doi;

    @Column(name = "impact_factor")
    private Double impactFactor;

    @Column(name = "document_url")
    private String documentUrl;
}
