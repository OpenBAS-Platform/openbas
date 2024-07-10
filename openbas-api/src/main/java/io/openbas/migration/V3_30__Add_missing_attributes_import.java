package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
public class V3_30__Add_missing_attributes_import extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement select = connection.createStatement();
    // Create table
    select.execute("""
          ALTER TABLE inject_importers ADD COLUMN importer_name VARCHAR(255) NOT NULL DEFAULT '';
     """);

    select.execute("""
          UPDATE injectors_contracts SET injector_contract_import_available = true WHERE injector_contract_labels -> 'en' LIKE ANY(ARRAY['%SMS%', '%Send%mail%']);
     """);

  }
}