-- Additive provenance for digital twin readings. Safe to re-run.
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'digital_twin_metrics'
    AND column_name = 'source_class'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE digital_twin_metrics ADD COLUMN source_class VARCHAR(16) NULL',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE digital_twin_metrics
SET source_class = CASE WHEN is_simulated = 1 THEN 'SIMULATED' ELSE 'ESTIMATED' END
WHERE source_class IS NULL;

SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'digital_twin_metrics'
    AND index_name = 'idx_dtm_type_time'
);
SET @sql = IF(@idx_exists = 0,
  'CREATE INDEX idx_dtm_type_time ON digital_twin_metrics (metric_type, timestamp)',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
