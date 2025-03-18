package io.openbas.migration;

import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_74__Add_Custom_Dashboard extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    try (Statement statement = context.getConnection().createStatement()) {
      statement.execute(
          """
              CREATE TABLE custom_dashboards (
                  custom_dashboard_id varchar(255) NOT NULL CONSTRAINT custom_dashboards_pkey PRIMARY KEY,
                  custom_dashboard_name VARCHAR(255) NOT NULL,
                  custom_dashboard_description VARCHAR(255),
                  custom_dashboard_content JSONB,
                  custom_dashboard_created_at TIMESTAMP DEFAULT now(),
                  custom_dashboard_updated_at TIMESTAMP DEFAULT now()
              );
              """);
    }
  }
}
