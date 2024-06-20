package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
public class V3_31__Add_timestamp_columns extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement select = connection.createStatement();
    // Create table
    select.execute("""
             ALTER TABLE import_mappers ADD COLUMN mapper_created_at TIMESTAMP DEFAULT now();
        """);

    select.execute("""
             ALTER TABLE import_mappers ADD COLUMN mapper_updated_at TIMESTAMP DEFAULT now();
        """);

  }
}