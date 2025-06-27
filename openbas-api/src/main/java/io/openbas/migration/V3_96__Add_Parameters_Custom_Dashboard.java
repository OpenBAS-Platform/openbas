package io.openbas.migration;

import java.sql.Connection;
import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_96__Add_Parameters_Custom_Dashboard extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    try (Statement statement = connection.createStatement()) {
      statement.execute(
          "ALTER TABLE custom_dashboards "
              + "ADD COLUMN IF NOT EXISTS custom_dashboard_parameters hstore");
      statement.execute(
          "ALTER TABLE exercises "
              + "ADD COLUMN IF NOT EXISTS exercise_custom_dashboard VARCHAR(255) NULL");
      statement.execute(
          "ALTER TABLE exercises "
              + "ADD CONSTRAINT exercise_custom_dashboard_fk FOREIGN KEY (exercise_custom_dashboard) REFERENCES custom_dashboards(custom_dashboard_id) ON DELETE SET NULL");
    }
  }
}
