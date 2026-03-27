-- V16: Add device_info column to login_logs table

SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'login_logs'
      AND column_name = 'device_info'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE login_logs ADD COLUMN device_info TEXT',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
