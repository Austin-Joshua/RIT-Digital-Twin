$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/rit_digital_twin?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true"
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="root"
$env:APP_JWT_SECRET="RITDigitalTwinSmartCampusIntelligencePlatformSecretKey2026VeryLongSecureKey"

Write-Host "Starting Backend..."
$wrapperJar = ".mvn/wrapper/maven-wrapper.jar"
$mainClass = "org.apache.maven.wrapper.MavenWrapperMain"

java "-Dmaven.multiModuleProjectDirectory=$PWD" -cp $wrapperJar $mainClass spring-boot:run
