package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Statement;

@Component
public class V3_91__Add_time_filters_in_custom_dashboards extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Statement select = context.getConnection().createStatement();
    select.execute(
        """
                ALTER TABLE custom_dashboards ADD COLUMN custom_dashboard_time_range varchar(255);
                ALTER TABLE custom_dashboards ADD COLUMN custom_dashboard_start_date TIMESTAMP (255);
                ALTER TABLE custom_dashboards ADD COLUMN custom_dashboard_end_date TIMESTAMP (255);
            """);


  }
}
