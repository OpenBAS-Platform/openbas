package io.openbas.migration;

import java.sql.Connection;
import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_92__Migrate_findings_CVE_new_format extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    Statement statement = connection.createStatement();
    statement.executeUpdate(
        "UPDATE findings "
            + "SET finding_value = substring(finding_value FROM '^[^:]+:([^()]+)') "
            + "WHERE finding_type = 'CVE';");
  }
}
