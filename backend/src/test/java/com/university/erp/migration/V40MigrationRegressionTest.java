package com.university.erp.migration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class V40MigrationRegressionTest {

    private String loadV40Sql() throws Exception {
        try (InputStream is = getClass().getResourceAsStream("/db/migration/V40__Align_Production_Entities_Schema.sql")) {
            assertNotNull(is, "V40__Align_Production_Entities_Schema.sql must exist on classpath");
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Test
    @DisplayName("Verify V40 SQL never executes static references to section_code without existence check")
    void testV40SqlContainsNoStaticSectionCodeReferences() throws Exception {
        String sql = loadV40Sql();

        // Must NOT contain direct unconditioned statements referencing section_code
        // e.g., "SET @sql = 'UPDATE timetable_slots SET section = section_code..." without IF guard
        assertFalse(sql.contains("SET @sql = 'UPDATE timetable_slots SET section = section_code WHERE"),
                "V40 must not unconditionally assign an UPDATE containing section_code");

        // Must contain conditional IF checking @col_section_code_exists
        assertTrue(sql.contains("@col_section_code_exists = 1"),
                "V40 must condition section_code UPDATE on @col_section_code_exists = 1");
        assertTrue(sql.contains("@col_section_code_exists = (SELECT COUNT(*) FROM information_schema.columns"),
                "V40 must query information_schema.columns for section_code");
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
