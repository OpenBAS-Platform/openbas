package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Statement;

@Component
public class V3_90__add_automatic_finding_hash_column extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    try (Statement statement = context.getConnection().createStatement()) {

      String updateInjectExpectationResult =
          """
          -- necessary for hashing functions
          CREATE EXTENSION IF NOT EXISTS pgcrypto;
          
          CREATE OR REPLACE FUNCTION compute_finding_identity(id TEXT)
          RETURNS TEXT
          AS
          $$
            BEGIN
              RETURN (
                SELECT digest(
                  concat(
                      finding_field,
                      finding_type,
                      finding_type,
                      finding_value,
                      array_to_string(finding_labels, ''),
                      finding_name,
                      i.inject_content,
                      i.inject_injector_contract,
                      -- to force differentiating between identical atomic tests
                      -- use an ad hoc random uuid instead of a scenario id.
                      -- also assume a single scenario per simulation
                      COALESCE(se.scenario_id, gen_random_uuid()::text)
                  ),
                  'sha256') as identity_hash_value
                FROM findings f
                  JOIN injects i
                    ON f.finding_inject_id = i.inject_id
                  LEFT JOIN exercises e
                    ON e.exercise_id = i.inject_exercise
                  LEFT JOIN scenarios_exercises se
                    ON e.exercise_id = se.exercise_id
                where finding_id = id
              );
            END;
            $$ LANGUAGE plpgsql;
          
          ALTER TABLE findings
          ADD COLUMN finding_identity_hash TEXT NULL;
          
          CREATE OR REPLACE FUNCTION update_finding_identity_hash_trigger()
          RETURNS TRIGGER AS $$
          BEGIN
              UPDATE findings
              SET finding_identity_hash = compute_finding_identity(NEW.finding_id)
              WHERE finding_id = NEW.finding_id;
              RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
          
          CREATE OR REPLACE TRIGGER after_insert_finding
          AFTER INSERT ON findings
          FOR EACH ROW
          EXECUTE PROCEDURE update_finding_identity_hash_trigger();
          
          CREATE OR REPLACE TRIGGER after_update_finding
          AFTER UPDATE OF finding_field,
                      finding_type,
                      finding_value,
                      finding_labels,
                      finding_name,
                      finding_inject_id ON findings
          FOR EACH ROW
          EXECUTE PROCEDURE update_finding_identity_hash_trigger();
          
          -- migration of existing records
          UPDATE findings
          SET finding_identity_hash = compute_finding_identity(finding_id)
          WHERE finding_identity_hash IS NULL;
          """;

      statement.executeUpdate(updateInjectExpectationResult);
    }
  }
}
