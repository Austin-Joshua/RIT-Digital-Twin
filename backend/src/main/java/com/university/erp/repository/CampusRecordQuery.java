package com.university.erp.repository;

import com.university.erp.intelligence.SourceClass;
import com.university.erp.model.DigitalTwinMetrics;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Queries that do not belong on the Spring Data interfaces.
 * Keeping them here avoids a second derived method with the same name.
 */
@Repository
public class CampusRecordQuery {

    @PersistenceContext
    private EntityManager entityManager;

    public List<Object[]> countStudentsBySection() {
        return entityManager.createQuery(
                        "select s.section, count(s) from Student s where s.section is not null group by s.section",
                        Object[].class)
                .getResultList();
    }

    public List<DigitalTwinMetrics> historicalSamples(Collection<String> types, LocalDateTime before, Pageable pageable) {
        return entityManager.createQuery(
                        "select m from DigitalTwinMetrics m where m.metricType in :types and m.timestamp < :before and m.sourceClass = :historical and (m.scenarioName is null or m.scenarioName = '') and (m.isSimulated is null or m.isSimulated = false) order by m.timestamp desc",
                        DigitalTwinMetrics.class)
                .setParameter("types", types)
                .setParameter("before", before)
                .setParameter("historical", SourceClass.HISTORICAL)
                .setMaxResults(pageable.getPageSize())
                .getResultList();
    }
}
