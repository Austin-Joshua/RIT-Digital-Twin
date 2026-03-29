import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
public class DropDB {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:mysql://127.0.0.1:3306/?allowPublicKeyRetrieval=true&useSSL=false";
        try (Connection conn = DriverManager.getConnection(url, "root", "123456");
             Statement stmt = conn.createStatement()) {
            stmt.execute("DROP DATABASE IF EXISTS rit_digital_twin");
            stmt.execute("CREATE DATABASE rit_digital_twin");
            System.out.println("Database reset successfully.");
        }
    }
}
