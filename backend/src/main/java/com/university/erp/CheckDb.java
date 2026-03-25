package com.university.erp;

import java.sql.*;

public class CheckDb {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/rit_digital_twin?useSSL=false";
        String user = "root";
        String pass = "123456";
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            DatabaseMetaData md = conn.getMetaData();
            ResultSet rs = md.getColumns(null, null, "users", "failed_login_attempts");
            if (rs.next()) {
                System.out.println("COLUMN failed_login_attempts EXISTS!");
            } else {
                System.out.println("COLUMN failed_login_attempts MISSING!");
            }
            
            System.out.println("ALL COLUMNS IN users:");
            rs = md.getColumns(null, null, "users", null);
            while (rs.next()) {
                System.out.println("- " + rs.getString("COLUMN_NAME"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
