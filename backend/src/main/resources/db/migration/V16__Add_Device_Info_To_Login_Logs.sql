-- V16: Add device_info column to login_logs table

SET @tbl_exists = (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'login_logs'
);
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'login_logs'
      AND column_name = 'device_info'
);
SET @sql = IF(@tbl_exists = 1 AND @col_exists = 0,
    'ALTER TABLE login_logs ADD COLUMN device_info TEXT',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
