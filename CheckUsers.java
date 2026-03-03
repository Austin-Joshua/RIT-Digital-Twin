import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckUsers {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/rit_digital_twin", "root",
                    "123456");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT email, password FROM users");
            while (rs.next()) {
                System.out.println("User: " + rs.getString("email") + " | Hash: " + rs.getString("password"));
            }
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
