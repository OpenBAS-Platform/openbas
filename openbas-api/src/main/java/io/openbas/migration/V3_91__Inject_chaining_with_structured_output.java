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
          "ALTER TABLE injects ADD COLUMN inject_first_execution_date TIMESTAMP WITH TIME ZONE;");

      statement.execute(
          """
            CREATE TABLE inject_bindings (
                inject_binding_id VARCHAR(255) NOT NULL CONSTRAINT inject_bindings_pkey PRIMARY KEY,

                inject_binding_target_inject_id VARCHAR(255) NOT NULL,
                inject_binding_source_inject_id VARCHAR(255) NOT NULL,
                inject_binding_argument_key VARCHAR(255) NOT NULL,
                inject_binding_argument_value VARCHAR(255) NOT NULL,
                inject_binding_status_id VARCHAR(255) NOT NULL,

                CONSTRAINT fk_target_inject
                    FOREIGN KEY (inject_binding_target_inject_id)
                    REFERENCES injects(inject_id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_source_inject
                    FOREIGN KEY (inject_binding_source_inject_id)
                    REFERENCES injects(inject_id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_status
                    FOREIGN KEY (inject_binding_status_id)
                    REFERENCES injects_statuses(status_id)
                    ON DELETE CASCADE,

                CONSTRAINT uq_target_source_key
                    UNIQUE (inject_binding_target_inject_id, inject_binding_source_inject_id, inject_binding_argument_key)
            );
        """);

      statement.execute(
          """
            CREATE TABLE inject_mappings (
                inject_mapping_id VARCHAR(255) NOT NULL CONSTRAINT inject_mappings_pkey PRIMARY KEY,
                inject_mapping_inject_parent_id VARCHAR(255) NOT NULL,
                inject_mapping_inject_children_id VARCHAR(255) NOT NULL,
                inject_mapping_source_key VARCHAR(255) NOT NULL,
                inject_mapping_target_key VARCHAR(255) NOT NULL,

                CONSTRAINT fk_mapping_to_dependency
                    FOREIGN KEY (inject_mapping_inject_parent_id, inject_mapping_inject_children_id)
                    REFERENCES injects_dependencies (inject_parent_id, inject_children_id)
                    ON DELETE CASCADE,
                CONSTRAINT uq_dep_out_in
                    UNIQUE (inject_mapping_inject_parent_id, inject_mapping_inject_children_id, inject_mapping_source_key, inject_mapping_target_key)
            );
        """);
    }
  }
}
