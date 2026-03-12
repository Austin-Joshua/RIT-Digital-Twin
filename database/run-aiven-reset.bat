@echo off
REM Run from project root:  database\run-aiven-reset.bat
REM Generic remote MySQL reset helper (e.g. Railway).

set MYSQL_HOST=<REMOTE_MYSQL_HOST>
set MYSQL_PORT=<REMOTE_MYSQL_PORT>
set MYSQL_USER=<REMOTE_MYSQL_USER>
set MYSQL_DB=<REMOTE_MYSQL_DB>

echo Step 1/3: Wiping all tables...
mysql -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p --ssl-mode=REQUIRED %MYSQL_DB% < "%~dp0reset-aiven.sql"
if errorlevel 1 ( echo Failed. Check MySQL is in PATH and password. & pause & exit /b 1 )

echo Step 2/3: Running schema.sql...
mysql -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p --ssl-mode=REQUIRED %MYSQL_DB% < "%~dp0schema.sql"
if errorlevel 1 ( echo Failed. & pause & exit /b 1 )

echo Step 3/3: Running seed-data.sql...
mysql -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p --ssl-mode=REQUIRED %MYSQL_DB% < "%~dp0seed-data.sql"
if errorlevel 1 ( echo Failed. & pause & exit /b 1 )

echo Done. Database wiped and restored.
pause
