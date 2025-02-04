package io.openbas.migration;

import java.sql.Connection;
import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_66__Add_Payload_Properties extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    try (Statement statement = connection.createStatement()) {
      statement.execute(
          "ALTER TABLE payloads ADD COLUMN payload_version INTEGER;"
      );
      statement.execute(
          "DROP INDEX IF EXISTS payloads_unique;"
      );
      statement.execute(
          "CREATE UNIQUE INDEX payloads_unique ON payloads (payload_external_id, payload_version);"
      );
    }
  }
}
