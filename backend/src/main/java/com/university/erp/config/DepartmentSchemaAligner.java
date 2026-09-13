package com.university.erp.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Dev databases that never ran the department primary-key rename still store
 * {@code departments.dept_id}. Hibernate queries {@code id}. Rename before schema update.
 */
@Component
public class DepartmentSchemaAligner implements BeanPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(DepartmentSchemaAligner.class);
    private volatile boolean applied;

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if (applied || !(bean instanceof DataSource dataSource) || !"dataSource".equals(beanName)) {
            return bean;
        }
        applied = true;
        try {
            align(dataSource);
        } catch (SQLException exception) {
            log.warn("Department primary key was not aligned. Campus queries that expect departments.id may fail: {}",
                    exception.getMessage());
        }
        return bean;
    }

    private static void align(DataSource dataSource) throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            String schema = connection.getCatalog();
            if (schema == null || !tableExists(connection, schema, "departments")) {
                return;
            }
            boolean hasId = columnExists(connection, schema, "departments", "id");
            boolean hasDeptId = columnExists(connection, schema, "departments", "dept_id");
            if (hasId || !hasDeptId) {
                return;
            }
            try (Statement statement = connection.createStatement()) {
                statement.execute("SET FOREIGN_KEY_CHECKS = 0");
                for (ForeignKey key : referencing(connection, schema, "departments")) {
                    statement.execute("ALTER TABLE `" + key.table() + "` DROP FOREIGN KEY `" + key.name() + "`");
                }
                statement.execute("ALTER TABLE departments CHANGE COLUMN dept_id id BIGINT NOT NULL AUTO_INCREMENT");
                statement.execute("SET FOREIGN_KEY_CHECKS = 1");
            }
            log.info("Renamed departments.dept_id to departments.id so stored rows match the department entity.");
        }
    }

    private static boolean tableExists(Connection connection, String schema, String table) throws SQLException {
        return count(connection, """
                SELECT COUNT(*) FROM information_schema.tables
                WHERE table_schema = ? AND table_name = ?
                """, schema, table) > 0;
    }

    private static boolean columnExists(Connection connection, String schema, String table, String column) throws SQLException {
        return count(connection, """
                SELECT COUNT(*) FROM information_schema.columns
                WHERE table_schema = ? AND table_name = ? AND column_name = ?
                """, schema, table, column) > 0;
    }

    private static int count(Connection connection, String sql, String... args) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            for (int i = 0; i < args.length; i++) {
                statement.setString(i + 1, args[i]);
            }
            try (ResultSet rows = statement.executeQuery()) {
                return rows.next() ? rows.getInt(1) : 0;
            }
        }
    }

    private static List<ForeignKey> referencing(Connection connection, String schema, String table) throws SQLException {
        List<ForeignKey> keys = new ArrayList<>();
        try (PreparedStatement statement = connection.prepareStatement("""
                SELECT TABLE_NAME, CONSTRAINT_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME = ? AND CONSTRAINT_NAME IS NOT NULL
                """)) {
            statement.setString(1, schema);
            statement.setString(2, table);
            try (ResultSet rows = statement.executeQuery()) {
                while (rows.next()) {
                    keys.add(new ForeignKey(rows.getString(1), rows.getString(2)));
                }
            }
        }
        return keys;
    }

    private record ForeignKey(String table, String name) {
        private ForeignKey {
            if (!table.matches("[A-Za-z0-9_]+") || !name.matches("[A-Za-z0-9_]+")) {
                throw new IllegalArgumentException("Unexpected constraint name");
            }
        }
    }
}
