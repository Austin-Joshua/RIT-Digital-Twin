@echo off
set "JAVA_EXE=java.exe"
set "BASE_DIR=%~dp0"
set "WRAPPER_JAR=%BASE_DIR%.mvn\wrapper\maven-wrapper.jar"

echo Starting Backend with Local MySQL...
"%JAVA_EXE%" ^
  "-Dmaven.multiModuleProjectDirectory=%BASE_DIR%" ^
  -cp "%WRAPPER_JAR%" ^
  org.apache.maven.wrapper.MavenWrapperMain ^
  spring-boot:run
