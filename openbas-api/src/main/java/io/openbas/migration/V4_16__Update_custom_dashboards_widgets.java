package io.openbas.migration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

@Component
public class V4_16__Update_custom_dashboards_widgets extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Statement select = context.getConnection().createStatement();
    ObjectMapper mapper = new ObjectMapper();

    select.executeUpdate(
        "UPDATE custom_dashboards_parameters SET custom_dashboards_parameter_type = 'simulation';");

    ResultSet results =
        select.executeQuery(
            "SELECT widget_config,widget_id FROM widgets;");

    PreparedStatement statement =
        context
            .getConnection()
            .prepareStatement(
                "UPDATE widgets SET widget_config = to_json(?::json) WHERE widget_id=?");

    while (results.next()) {
      String widgetConfig = results.getString("widget_config");
      ObjectNode config = mapper.readValue(widgetConfig, ObjectNode.class);
      String widgetId = results.getString("widget_id");
      if (config != null) {
        String widgetConfigurationType = config.get("widget_configuration_type").asText();
        if (widgetConfigurationType != null) {
          if (widgetConfigurationType.equals("temporal-histogram")) {
            config.put("time_range", "CUSTOM");
            String dateAttribute = config.get("field").asText();
            config.put("date_attribute", dateAttribute);
            config.remove("field");
          }
          statement.setString(1, mapper.writeValueAsString(config));
          statement.setString(2, widgetId);
          statement.addBatch();
        }
      }
    }

    statement.executeBatch();
  }
}
