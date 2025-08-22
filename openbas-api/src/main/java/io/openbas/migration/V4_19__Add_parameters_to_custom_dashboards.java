package io.openbas.migration;

import static io.openbas.database.model.CustomDashboardParameters.CustomDashboardParameterType.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.UUID;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V4_19__Add_parameters_to_custom_dashboards extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    final Connection conn = context.getConnection();

    try (Statement select = conn.createStatement();
        ResultSet dashboardsResults =
            select.executeQuery("SELECT custom_dashboard_id FROM custom_dashboards;");
        PreparedStatement statementDashboard =
            conn.prepareStatement(
                "INSERT INTO custom_dashboards_parameters (custom_dashboards_parameter_id,custom_dashboard_id,custom_dashboards_parameter_name,custom_dashboards_parameter_type) VALUES (?,?,?,?) ON CONFLICT DO NOTHING")) {
      while (dashboardsResults.next()) {
        String dashboardId = dashboardsResults.getString("custom_dashboard_id");
        addParameter(statementDashboard, dashboardId, "Time range", TIME_RANGE.name);
        addParameter(statementDashboard, dashboardId, "Start date", START_DATE.name);
        addParameter(statementDashboard, dashboardId, "End date", END_DATE.name);
        statementDashboard.addBatch();
      }
      statementDashboard.executeBatch();
    }
  }

  private void addParameter(PreparedStatement ps, String dashboardId, String name, String type)
      throws Exception {
    ps.setString(1, UUID.randomUUID().toString());
    ps.setString(2, dashboardId);
    ps.setString(3, name);
    ps.setString(4, type);
    ps.addBatch();
  }
}
