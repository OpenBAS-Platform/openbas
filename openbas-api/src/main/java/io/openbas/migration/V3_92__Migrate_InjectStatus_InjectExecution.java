package io.openbas.migration;

import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_92__Migrate_InjectStatus_InjectExecution extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    try (Statement statement = context.getConnection().createStatement()) {

      Rename table injects_statuses to injects_executions;
      Rename table status_payload_output to execution_payload_output;
      Rename table status_name to execution_name;
      Rename table status_id to execution_id;
      Rename table status_inject to execution_inject;




    }
  }
}
