package io.openbas.migration;

import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_98__Add_unique_constraint_name_security_platform extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    try (Statement stmt = context.getConnection().createStatement()) {

      // 1. Create a temporary table to store old_id → new_id mapping
      stmt.execute(
          """
                CREATE TEMP TABLE temp_security_platform_mapping AS
                SELECT asset_id AS old_id,
                       MIN(asset_id) OVER (PARTITION BY asset_name) AS new_id
                FROM assets
                WHERE asset_type = 'SecurityPlatform';
            """);

      // 2. Update collectors
      stmt.execute(
          """
                UPDATE collectors c
                SET collector_security_platform = m.new_id
                FROM temp_security_platform_mapping m
                WHERE c.collector_security_platform = m.old_id
                  AND m.old_id != m.new_id;
            """);

      // 3. Update injects_expectations_traces
      stmt.execute(
          """
                UPDATE injects_expectations_traces t
                SET inject_expectation_trace_source_id = m.new_id
                FROM temp_security_platform_mapping m
                WHERE t.inject_expectation_trace_source_id = m.old_id
                  AND m.old_id != m.new_id;
            """);

      // 4. Update security_platform_logo_light
      stmt.execute(
          """
                UPDATE assets a
                SET security_platform_logo_light = m.new_id
                FROM temp_security_platform_mapping m
                WHERE a.security_platform_logo_light = m.old_id
                  AND m.old_id != m.new_id;
            """);

      // 5. Update security_platform_logo_dark
      stmt.execute(
          """
                UPDATE assets a
                SET security_platform_logo_dark = m.new_id
                FROM temp_security_platform_mapping m
                WHERE a.security_platform_logo_dark = m.old_id
                  AND m.old_id != m.new_id;
            """);

      // 6. Update tags
      stmt.execute(
          """
                UPDATE assets_tags at
                SET asset_id = m.new_id
                FROM temp_security_platform_mapping m
                WHERE at.asset_d = m.old_id
                  AND m.old_id != m.new_id;
            """);

      // 7. Delete duplicate SecurityPlatform assets
      stmt.execute(
          """
                DELETE FROM assets
                WHERE asset_id IN (
                    SELECT old_id
                    FROM temp_security_platform_mapping
                    WHERE old_id != new_id
                );
            """);

      // 8. Add the unique constraint
      stmt.execute(
          """
                CREATE UNIQUE INDEX unique_security_platform_name_idx
                ON assets (asset_name)
                WHERE asset_type = 'SecurityPlatform';
            """);

      // 8. Clean up
      stmt.execute("DROP TABLE temp_security_platform_mapping;");
    }
  }
}
