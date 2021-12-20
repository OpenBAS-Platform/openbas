package io.openex.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.util.UUID;


@Component
public class V1__Init extends BaseJavaMigration {

    private static final String ADMIN_EMAIL = "admin@openex.io";
    private static final String ADMIN_UUID = "89206193-dbfb-4513-a186-d72c037dda4c";
    private static final String ADMIN_TOKEN_UUID = "0d17ce9a-f3a8-4c6d-9721-c98dc3dc023f";
    private static final String ADMIN_PASSWORD = "admin";

    private void createAdminUser(Connection connection) throws Exception {
        Argon2PasswordEncoder passwordEncoder = new Argon2PasswordEncoder();
        String password = passwordEncoder.encode(ADMIN_PASSWORD);
        PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO users (user_id, " +
                        "user_login, user_email, user_firstname, user_lastname, " +
                        "user_password, user_status, user_admin, user_planificateur) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING ");
        statement.setString(1, ADMIN_UUID);
        statement.setString(2, ADMIN_EMAIL);
        statement.setString(3,ADMIN_EMAIL);
        statement.setString(4, "admin");
        statement.setString(5, "openex");
        statement.setString(6, password);
        statement.setInt(7, 1);
        statement.setBoolean(8, true);
        statement.setBoolean(9, true);
        statement.execute();
    }

    private void createAdminToken(Connection connection) throws Exception {
        PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO tokens (token_id, token_user, token_value, token_created_at) " +
                        "VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING");
        statement.setString(1, ADMIN_TOKEN_UUID);
        statement.setString(2, ADMIN_UUID);
        statement.setString(3, UUID.randomUUID().toString());
        statement.setDate(4, new Date(System.currentTimeMillis()));
        statement.execute();
    }

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        Statement schemaStatement = connection.createStatement();
        // Table not exists, must initialize the schema
        ClassPathResource classPathResource = new ClassPathResource("application.sql");
        InputStream inputStream = classPathResource.getInputStream();
        String schemaQuery = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        schemaStatement.execute(schemaQuery);
        // Looking for an already existing administrator
        String selectAdmin = "SELECT user_id FROM users WHERE user_email = '" + ADMIN_EMAIL + "'";
        ResultSet rs = connection.createStatement().executeQuery(selectAdmin);
        // If admin doesn't exist, create one
        if (!rs.next()) {
            // Create the default values (admin user, ...)
            createAdminUser(connection);
            createAdminToken(connection);
        }
    }
}