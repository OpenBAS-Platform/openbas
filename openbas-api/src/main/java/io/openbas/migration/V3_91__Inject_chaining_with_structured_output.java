package io.openbas.migration;

import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_91__Inject_chaining_with_structured_output extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    try (Statement statement = context.getConnection().createStatement()) {

      statement.execute("ALTER TABLE injects ADD COLUMN inject_status VARCHAR(255);");

      statement.execute(
          "ALTER TABLE asset_agent_jobs ADD COLUMN asset_agent_execution VARCHAR(255) "
              + "FOREIGN KEY (asset_agent_job_execution_id) "
              + "REFERENCES injects_statuses(status_id) "
              + "ON DELETE CASCADE;");

      statement.execute(
          "ALTER TABLE findings ADD COLUMN finding_execution_id VARCHAR(255) "
              + "FOREIGN KEY (finding_execution_id) "
              + "REFERENCES injects_statuses(status_id) "
              + "ON DELETE CASCADE;");

      statement.execute(
          "ALTER TABLE injects_expectations ADD COLUMN execution_id VARCHAR(255) "
              + "FOREIGN KEY (inject_expectation_execution_id) "
              + "REFERENCES injects_statuses(status_id) "
              + "ON DELETE CASCADE;");

      statement.execute(
          "ALTER TABLE injects ADD COLUMN inject_first_execution_date TIMESTAMP WITH TIME ZONE;");

      statement.execute("ALTER TABLE injects_statuses DROP INDEX uniq_658a47a864e0dbd;");

      statement.execute(
          """
            CREATE TABLE executions_bindings (
                execution_binding_id VARCHAR(255) NOT NULL CONSTRAINT execution_bindings_pkey PRIMARY KEY,

                execution_binding_source_execution_id VARCHAR(255) NOT NULL,
                execution_binding_argument_key VARCHAR(255) NOT NULL,
                execution_binding_argument_value VARCHAR(255) NOT NULL,
                execution_binding_execution_id VARCHAR(255) NOT NULL,

                CONSTRAINT fk_source_execution
                    FOREIGN KEY (execution_binding_source_execution_id)
                    REFERENCES injects_statuses(status_id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_status
                    FOREIGN KEY (execution_binding_execution_id)
                    REFERENCES injects_statuses(status_id)
                    ON DELETE CASCADE,

                CONSTRAINT uq_execution_binding_target_source_argument
                    UNIQUE (execution_binding_execution_id, execution_binding_source_execution_id, execution_binding_argument_key)
            );
        """);

      statement.execute(
          """
            CREATE TABLE injects_bindings (
                inject_binding_id VARCHAR(255) NOT NULL CONSTRAINT inject_bindings_pkey PRIMARY KEY,
                inject_binding_inject_parent_id VARCHAR(255) NOT NULL,
                inject_binding_inject_children_id VARCHAR(255) NOT NULL,
                inject_binding_source_key VARCHAR(255) NOT NULL,
                inject_binding_target_key VARCHAR(255) NOT NULL,

                CONSTRAINT fk_mapping_to_dependency
                    FOREIGN KEY (inject_binding_inject_parent_id, inject_binding_inject_children_id)
                    REFERENCES injects_dependencies (inject_parent_id, inject_children_id)
                    ON DELETE CASCADE,
                CONSTRAINT uq_inject_binding_target_source_key
                    UNIQUE (inject_binding_inject_parent_id, inject_binding_inject_children_id, inject_binding_source_key, inject_binding_target_key)
            );
        """);
    }
  }
}
