@REM Maven Wrapper for Windows
@echo off
setlocal

set "WRAPPER_JAR=%~dp0.mvn\wrapper\maven-wrapper.jar"

@REM Find Java
if not "%JAVA_HOME%"=="" (
    set "JAVACMD=%JAVA_HOME%\bin\java.exe"
) else (
    for %%i in (java.exe) do set "JAVACMD=%%~$PATH:i"
)

if not exist "%JAVACMD%" (
    echo Error: JAVA_HOME is not set and java.exe is not in PATH. >&2
    exit /B 1
)

if not exist "%WRAPPER_JAR%" (
    echo Downloading Maven Wrapper...
    powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar' -OutFile '%WRAPPER_JAR%' }"
)

"%JAVACMD%" %MVNW_JAVA_OPTS% -cp "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%~dp0." org.apache.maven.wrapper.MavenWrapperMain %*

endlocal
