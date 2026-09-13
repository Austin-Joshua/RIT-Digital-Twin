package com.university.erp.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Older schema.sql columns sit beside the entity columns. Hibernate writes
 * {@code buildings.name} and {@code classrooms.name}, but leftover NOT NULL
 * columns reject a new row. Relax those leftovers; do not invent values.
 */
@Component
public class CampusPhysicalSchemaAligner implements BeanPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(CampusPhysicalSchemaAligner.class);
    private volatile boolean applied;

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if (applied || !(bean instanceof DataSource dataSource) || !"dataSource".equals(beanName)) {
            return bean;
        }
        applied = true;
        try (Connection connection = dataSource.getConnection(); Statement statement = connection.createStatement()) {
            String schema = connection.getCatalog();
            if (schema == null) {
                return bean;
            }
            relax(statement, schema, "buildings", "building_name", "VARCHAR(255) NULL");
            relax(statement, schema, "buildings", "total_floors", "INT NULL");
            relax(statement, schema, "buildings", "location_coordinates", "VARCHAR(255) NULL");
            relax(statement, schema, "classrooms", "room_number", "VARCHAR(255) NULL");
        } catch (SQLException exception) {
            log.warn("Physical campus columns were not aligned: {}", exception.getMessage());
        }
        return bean;
    }

    private static void relax(Statement statement, String schema, String table, String column, String definition) throws SQLException {
        if (!columnExists(statement, schema, table, column)) {
            return;
        }
        statement.execute("ALTER TABLE `" + table + "` MODIFY `" + column + "` " + definition);
    }

    private static boolean columnExists(Statement statement, String schema, String table, String column) throws SQLException {
        try (var rows = statement.executeQuery(
                "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = '"
                        + schema.replace("'", "") + "' AND table_name = '" + table
                        + "' AND column_name = '" + column + "'")) {
            return rows.next() && rows.getInt(1) > 0;
        }
    }
}
