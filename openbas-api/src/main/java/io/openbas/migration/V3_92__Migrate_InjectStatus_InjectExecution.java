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

      statement.execute("ALTER TABLE injects_statuses RENAME TO injects_executions");
      statement.execute("ALTER TABLE injects_tests_statuses RENAME TO injects_tests_executions");

      statement.execute("ALTER TABLE injects_executions RENAME COLUMN status_id TO execution_id");
      statement.execute("ALTER TABLE injects_executions RENAME COLUMN status_inject TO execution_inject");
      statement.execute("ALTER TABLE injects_executions RENAME COLUMN status_payload_output TO execution_payload_output");

      statement.execute("ALTER TABLE injects_tests_executions RENAME COLUMN status_id TO execution_id");
      statement.execute("ALTER TABLE injects_tests_executions RENAME COLUMN status_inject TO execution_inject");
      statement.execute("ALTER TABLE injects_tests_executions RENAME COLUMN status_payload_output TO execution_payload_output");

      statement.execute("ALTER TABLE execution_traces RENAME COLUMN execution_inject_status_id TO execution_inject_execution_id");
      statement.execute("ALTER TABLE execution_traces RENAME COLUMN execution_inject_test_status_id TO execution_inject_test_execution_id");
    }
  }
}
