package io.openaev.migration;

import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

/**
 * Lets a tenant delete go through: two foreign keys on the path of the tenant cascade had no {@code
 * ON DELETE CASCADE}, so deleting a tenant that owns such rows was refused.
 *
 * <ul>
 *   <li>{@code collector_types.tenant_id}: every onboarded tenant gets collector types, so no
 *       onboarded tenant could be deleted. The rows referencing a collector type ({@code
 *       collectors}, {@code payloads}, {@code detection_remediations}) belong to the same tenant
 *       and already cascade with it.
 *   <li>{@code scenario_mails_reply_to.scenario_id}: a scenario gets a default reply-to address, so
 *       a tenant with a scenario could not be deleted either. Same fix as {@code
 *       exercise_mails_reply_to} in V5_21.
 * </ul>
 *
 * <p>Both columns also get the index a cascading foreign key needs.
 */
@Component
public class V6_20261021090000000__Cascade_tenant_delete_to_collector_types_and_scenario_reply_to
    extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    try (Statement statement = context.getConnection().createStatement()) {
      statement.execute(
          """
          ALTER TABLE collector_types DROP CONSTRAINT IF EXISTS fk_collector_type_tenant;
          ALTER TABLE collector_types
            ADD CONSTRAINT fk_collector_type_tenant
            FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE;
          CREATE INDEX IF NOT EXISTS idx_collector_types_tenant_id ON collector_types(tenant_id);
          """);
      statement.execute(
          """
          ALTER TABLE scenario_mails_reply_to DROP CONSTRAINT IF EXISTS fk_scenario_id;
          ALTER TABLE scenario_mails_reply_to
            ADD CONSTRAINT fk_scenario_id
            FOREIGN KEY (scenario_id) REFERENCES scenarios(scenario_id) ON DELETE CASCADE;
          CREATE INDEX IF NOT EXISTS idx_scenario_mails_reply_to_scenario_id
            ON scenario_mails_reply_to(scenario_id);
          """);
    }
  }
}
