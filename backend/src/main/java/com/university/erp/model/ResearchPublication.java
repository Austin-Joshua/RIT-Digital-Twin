package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "research_publications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class ResearchPublication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Builder.Default
    private String type = "Journal";

    private String publisher;

    @Column(name = "publication_date")
    private String publicationDate;

    @Builder.Default
    private String status = "Published";

    @Builder.Default
    private Integer citations = 0;

    @Column(columnDefinition = "TEXT")
    private String abstractText;

    private String authors;

    private String doi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
