package io.openbas.migration;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.PayloadCommandBlock;
import io.openbas.database.model.PayloadOutput;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.List;

@Component
public class V3_49__Update_Commands_In_Inject_Status extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Statement select = context.getConnection().createStatement();

    select.execute("ALTER TABLE injects_statuses ADD status_payload_output text;");

    ResultSet results =
        select.executeQuery("SELECT status_commands_lines FROM injects_statuses");

    PreparedStatement statement = context.getConnection().prepareStatement(
        "INSERT INTO injects_statuses (status_payload_output) VALUES (?) ON CONFLICT DO NOTHING;"
    );

    while (results.next()) {
      String commandLine = results.getString("status_commands_lines");
      JSONObject jsonObject = new JSONObject(commandLine);
      String content = jsonObject.getString("content");
      String cleanupCommand = jsonObject.getString("cleanup_command");
      String externalId = jsonObject.getString("external_id");
      PayloadOutput payloadOutput = new PayloadOutput(null, null, null, null, null, null, null, null,
          externalId, null,
          null, List.of(new PayloadCommandBlock(null, content, List.of(cleanupCommand))), null);
      select.executeUpdate("INSERT INTO injects_statuses (status_payload_output) VALUES ('" + payloadOutput
          + "') ON CONFLICT DO NOTHING;)");
    }

    select.execute("ALTER TABLE injects_statuses DROP column status_commands_lines;");
  }

}
