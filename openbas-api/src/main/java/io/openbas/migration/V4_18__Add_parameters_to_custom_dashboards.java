package io.openbas.migration;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.UUID;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V4_18__Add_parameters_to_custom_dashboards extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Statement select = context.getConnection().createStatement();

    ResultSet dashboardsResults =
        select.executeQuery("SELECT custom_dashboard_id FROM custom_dashboards;");

    PreparedStatement statementDashboard =
        context
            .getConnection()
            .prepareStatement(
                "INSERT INTO custom_dashboards_parameters (custom_dashboards_parameter_id,custom_dashboard_id,custom_dashboards_parameter_name,custom_dashboards_parameter_type) VALUES (?,?,?,?) ON CONFLICT DO NOTHING");

    while (dashboardsResults.next()) {
      String dashboardId = dashboardsResults.getString("custom_dashboard_id");
      statementDashboard.setString(1, UUID.randomUUID().toString());
      statementDashboard.setString(2, dashboardId);
      statementDashboard.setString(3, "Time range");
      statementDashboard.setString(4, "timeRange");
      statementDashboard.addBatch();
      statementDashboard.setString(1, UUID.randomUUID().toString());
      statementDashboard.setString(2, dashboardId);
      statementDashboard.setString(3, "Start date");
      statementDashboard.setString(4, "startDate");
      statementDashboard.addBatch();
      statementDashboard.setString(1, UUID.randomUUID().toString());
      statementDashboard.setString(2, dashboardId);
      statementDashboard.setString(3, "End date");
      statementDashboard.setString(4, "endDate");
      statementDashboard.addBatch();
    }
    statementDashboard.executeBatch();
  }
}
