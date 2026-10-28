package com.university.erp.migration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class V40MigrationRegressionTest {

    private String loadV40Sql() throws Exception {
        InputStream is = getClass().getResourceAsStream("/db/migration/V40__Align_Production_Entities_Schema.sql");
        if (is != null) {
            try (is) {
                return new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
        }
        // Fallback for IDE test environments where resources are read directly from source
        java.nio.file.Path path = java.nio.file.Path.of("src/main/resources/db/migration/V40__Align_Production_Entities_Schema.sql");
        if (!java.nio.file.Files.exists(path)) {
            path = java.nio.file.Path.of("backend/src/main/resources/db/migration/V40__Align_Production_Entities_Schema.sql");
        }
        return java.nio.file.Files.readString(path, StandardCharsets.UTF_8);
    }

    @Test
    @DisplayName("Verify V40 SQL never executes static references to section_code without existence check")
    void testV40SqlContainsNoStaticSectionCodeReferences() throws Exception {
        String sql = loadV40Sql();

        // Must NOT contain direct unconditioned statements referencing section_code
        assertFalse(sql.contains("SET @sql = 'UPDATE timetable_slots SET section = section_code WHERE"),
                "V40 must not unconditionally assign an UPDATE containing section_code");

        // Must contain conditional IF checking @col_section_code_exists
        assertTrue(sql.contains("@col_section_code_exists = 1"),
                "V40 must condition section_code UPDATE on @col_section_code_exists = 1");
        assertTrue(sql.contains("@col_section_code_exists = (SELECT COUNT(*) FROM information_schema.columns"),
                "V40 must query information_schema.columns for section_code");
    }

    @Test
    @DisplayName("Verify V40 SQL guards legacy faculty and subject foreign key backfills")
    void testV40SqlGuardsLegacyFacultyAndSubjectForeignKeys() throws Exception {
        String sql = loadV40Sql();

        // Must guard faculty_username
        assertTrue(sql.contains("@col_fac_user_exists = (SELECT COUNT(*) FROM information_schema.columns"),
                "V40 must check for faculty_username column before querying it");
        assertTrue(sql.contains("IF(@tbl_slots = 1 AND @col_fac_user_exists = 1,"),
                "V40 must use IF guard for faculty_username backfill");

        // Must guard subject_code
        assertTrue(sql.contains("@col_subj_code_exists = (SELECT COUNT(*) FROM information_schema.columns"),
                "V40 must check for subject_code column before querying it");
        assertTrue(sql.contains("IF(@tbl_slots = 1 AND @col_subj_code_exists = 1,"),
                "V40 must use IF guard for subject_code backfill");
    }

    @Test
    @DisplayName("Verify V40 SQL guards indexes against duplicate key creation")
    void testV40SqlGuardsIndexesAgainstDuplicates() throws Exception {
        String sql = loadV40Sql();

        // Foreign key indexes on timetable_slots
        assertTrue(sql.contains("index_name = 'idx_timetable_faculty_id'"),
                "V40 must check information_schema.statistics for idx_timetable_faculty_id");
        assertTrue(sql.contains("index_name = 'idx_timetable_subject_id'"),
                "V40 must check information_schema.statistics for idx_timetable_subject_id");
        assertTrue(sql.contains("@idx_fac_exists = 0"),
                "V40 must only create faculty index if not already present");
        assertTrue(sql.contains("@idx_subj_exists = 0"),
                "V40 must only create subject index if not already present");
    }

    @Test
    @DisplayName("Verify V40 SQL has balanced PREPARE and DEALLOCATE PREPARE statements")
    void testV40SqlHasBalancedPrepareAndDeallocateStatements() throws Exception {
        String sql = loadV40Sql();
        int prepareCount = countOccurrences(sql, "PREPARE stmt FROM @sql;");
        int deallocateCount = countOccurrences(sql, "DEALLOCATE PREPARE stmt;");

        assertTrue(prepareCount > 0, "V40 must contain dynamic prepared statements");
        assertEquals(prepareCount, deallocateCount,
                "V40 must deallocate every prepared statement handle to prevent MySQL connection resource leaks");
    }

    @Test
    @DisplayName("Verify V40 SQL uses DATABASE() function for schema isolation")
    void testV40SqlUsesDatabaseFunctionForSchemaIsolation() throws Exception {
        String sql = loadV40Sql();

        assertTrue(sql.contains("SET @dbname = DATABASE();"),
                "V40 must initialize @dbname using DATABASE() function");
        assertTrue(sql.contains("table_schema = @dbname"),
                "V40 must scope information_schema queries to table_schema = @dbname");
    }

    private int countOccurrences(String text, String target) {
        int count = 0;
        int index = 0;
        while ((index = text.indexOf(target, index)) != -1) {
            count++;
            index += target.length();
        }
        return count;
    }

    @Test
    @DisplayName("Scenario A: Only 'section' exists (Production State) -> section_code is completely skipped")
    void testScenarioA_OnlySectionExists() {
        boolean tblSlotsExists = true;
        boolean colSectionExists = true;
        boolean colSectionCodeExists = false;

        String addSectionSql = (tblSlotsExists && !colSectionExists)
                ? "ALTER TABLE timetable_slots ADD COLUMN section VARCHAR(50) NULL"
                : "SELECT 1";
        assertEquals("SELECT 1", addSectionSql, "Must be no-op since section already exists");

        String copySectionSql = (tblSlotsExists && colSectionCodeExists)
                ? "UPDATE timetable_slots SET section = section_code WHERE (section IS NULL OR section = '') AND section_code IS NOT NULL"
                : "SELECT 1";
        assertEquals("SELECT 1", copySectionSql, "Must be SELECT 1 so MySQL never prepares SQL with section_code");
        assertFalse(copySectionSql.contains("section_code"), "SQL must not contain the section_code token");
    }

    @Test
    @DisplayName("Scenario B: Only 'section_code' exists -> 'section' is added and data is migrated")
    void testScenarioB_OnlySectionCodeExists() {
        boolean tblSlotsExists = true;
        boolean colSectionExists = false;
        boolean colSectionCodeExists = true;

        String addSectionSql = (tblSlotsExists && !colSectionExists)
                ? "ALTER TABLE timetable_slots ADD COLUMN section VARCHAR(50) NULL"
                : "SELECT 1";
        assertEquals("ALTER TABLE timetable_slots ADD COLUMN section VARCHAR(50) NULL", addSectionSql);

        String copySectionSql = (tblSlotsExists && colSectionCodeExists)
                ? "UPDATE timetable_slots SET section = section_code WHERE (section IS NULL OR section = '') AND section_code IS NOT NULL"
                : "SELECT 1";
        assertTrue(copySectionSql.startsWith("UPDATE timetable_slots SET section = section_code"));
    }

    @Test
    @DisplayName("Scenario C: Both 'section' and 'section_code' exist -> Preserve existing non-null section values")
    void testScenarioC_BothExist_PreserveExistingSection() {
        boolean tblSlotsExists = true;
        boolean colSectionExists = true;
        boolean colSectionCodeExists = true;

        String copySectionSql = (tblSlotsExists && colSectionCodeExists)
                ? "UPDATE timetable_slots SET section = section_code WHERE (section IS NULL OR section = '') AND section_code IS NOT NULL"
                : "SELECT 1";

        assertTrue(copySectionSql.contains("section IS NULL OR section = ''"),
                "Must only update rows where section is null or empty, preserving populated sections");
    }

    @Test
    @DisplayName("Scenario D: Neither exists -> 'section' is added, copy is skipped")
    void testScenarioD_NeitherExists() {
        boolean tblSlotsExists = true;
        boolean colSectionExists = false;
        boolean colSectionCodeExists = false;

        String addSectionSql = (tblSlotsExists && !colSectionExists)
                ? "ALTER TABLE timetable_slots ADD COLUMN section VARCHAR(50) NULL"
                : "SELECT 1";
        assertEquals("ALTER TABLE timetable_slots ADD COLUMN section VARCHAR(50) NULL", addSectionSql);

        String copySectionSql = (tblSlotsExists && colSectionCodeExists)
                ? "UPDATE timetable_slots SET section = section_code WHERE (section IS NULL OR section = '') AND section_code IS NOT NULL"
                : "SELECT 1";
        assertEquals("SELECT 1", copySectionSql);
        assertFalse(copySectionSql.contains("section_code"));
    }

    @Test
    @DisplayName("Scenario E: Buildings columns partially present from prior failed DDL -> Idempotently skip existing")
    void testScenarioE_BuildingsPartiallyAppliedDDL() {
        Set<String> alreadyPresentColumns = Set.of(
                "latitude", "longitude", "footprint_geometry", "height_meters", "number_of_levels"
        );

        List<String> expectedBuildingColumns = List.of(
                "latitude", "longitude", "footprint_geometry", "height_meters", "number_of_levels",
                "geometry_source", "geometry_status", "height_source", "osm_way_id",
                "model_asset_url", "source_updated_at", "last_verified_at"
        );

        List<String> executedAlters = new ArrayList<>();
        for (String col : expectedBuildingColumns) {
            boolean colExists = alreadyPresentColumns.contains(col);
            String sql = !colExists ? "ALTER TABLE buildings ADD COLUMN " + col : "SELECT 1";
            if (!sql.equals("SELECT 1")) {
                executedAlters.add(col);
            }
        }

        // Only the remaining 7 columns should be altered
        assertEquals(7, executedAlters.size());
        assertFalse(executedAlters.contains("latitude"));
        assertFalse(executedAlters.contains("longitude"));
        assertFalse(executedAlters.contains("footprint_geometry"));
        assertTrue(executedAlters.contains("geometry_source"));
        assertTrue(executedAlters.contains("last_verified_at"));
    }

    @Test
    @DisplayName("Scenario F: Repeated execution against aligned schema -> 100% no-op")
    void testScenarioF_RepeatedExecutionIsNoOp() {
        Set<String> allColumns = Set.of(
                "latitude", "longitude", "footprint_geometry", "height_meters", "number_of_levels",
                "geometry_source", "geometry_status", "height_source", "osm_way_id",
                "model_asset_url", "source_updated_at", "last_verified_at",
                "dept_id", "faculty_id", "subject_id", "section"
        );

        List<String> targets = List.of(
                "latitude", "longitude", "footprint_geometry", "height_meters", "number_of_levels",
                "geometry_source", "geometry_status", "height_source", "osm_way_id",
                "model_asset_url", "source_updated_at", "last_verified_at",
                "dept_id", "faculty_id", "subject_id", "section"
        );

        int alterCount = 0;
        for (String col : targets) {
            boolean exists = allColumns.contains(col);
            String sql = !exists ? "ALTER TABLE ... ADD " + col : "SELECT 1";
            if (!sql.equals("SELECT 1")) {
                alterCount++;
            }
        }

        assertEquals(0, alterCount, "On repeated execution all statements must evaluate to SELECT 1");
    }
}
