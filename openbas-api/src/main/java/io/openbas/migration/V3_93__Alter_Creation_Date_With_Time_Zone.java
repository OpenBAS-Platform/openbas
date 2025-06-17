package io.openbas.migration;

import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_93__Alter_Creation_Date_With_Time_Zone extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    try (Statement statement = context.getConnection().createStatement()) {
      statement.execute(
          """
                  ALTER TABLE attack_patterns ALTER COLUMN attack_pattern_created_at type timestamp with time zone using attack_pattern_created_at::timestamp with time zone;
                  ALTER TABLE attack_patterns ALTER COLUMN attack_pattern_updated_at type timestamp with time zone using attack_pattern_updated_at::timestamp with time zone;

                  ALTER TABLE injects_expectations ALTER COLUMN inject_expectation_created_at type timestamp with time zone using inject_expectation_created_at::timestamp with time zone;
                  ALTER TABLE injects_expectations ALTER COLUMN inject_expectation_updated_at type timestamp with time zone using inject_expectation_updated_at::timestamp with time zone;
              """);
    }
  }
}
