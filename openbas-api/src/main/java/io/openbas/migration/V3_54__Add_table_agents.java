package io.openbas.migration;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.UUID;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_54__Add_table_agents extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Statement select = context.getConnection().createStatement();
    select.execute(
        """
                        CREATE TABLE agents (
                            agent_id UUID NOT NULL CONSTRAINT agents_pkey PRIMARY KEY,
                            agent_asset_id VARCHAR(255) NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
                            agent_privilege VARCHAR(255) NOT NULL,
                            agent_deployment_mode VARCHAR(255) NOT NULL,
                            agent_executed_by_user VARCHAR(255) NOT NULL,
                            agent_executor_id VARCHAR(255) NOT NULL REFERENCES executors(executor_id) ON DELETE CASCADE,
                            agent_version VARCHAR(255) NOT NULL,
                            agent_last_seen TIMESTAMP,
                            agent_created_at TIMESTAMP DEFAULT now(),
                            agent_updated_at TIMESTAMP DEFAULT now()
                          );
                          CREATE INDEX idx_agents ON agents(agent_id);
                """);

    // Migration datas
    ResultSet resultAgentExecutor =
        select.executeQuery(
            "SELECT executor_id FROM executors where executor_type='openbas_caldera'");
    String executorCalderaId = "";
    if (resultAgentExecutor.next()) {
      executorCalderaId = resultAgentExecutor.getString("executor_id");
    }
    ResultSet results =
        select.executeQuery(
            "SELECT * FROM assets WHERE asset_type='Endpoint' AND asset_executor IS NOT NULL");
    PreparedStatement statement =
        context
            .getConnection()
            .prepareStatement(
                """
                INSERT INTO agents(agent_id, agent_asset_id, agent_privilege, agent_deployment_mode, agent_executed_by_user, agent_executor_id, agent_version, agent_last_seen)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """);
    while (results.next()) {
      UUID generatedUUID = UUID.randomUUID();
      statement.setObject(1, generatedUUID);
      statement.setString(2, results.getString("asset_id"));
      statement.setString(3, "ADMIN");
      statement.setString(
          4, executorCalderaId.equals(results.getString("asset_executor")) ? "SESSION" : "SERVICE");
      statement.setString(
          5,
          "Windows".equals(results.getString("endpoint_platform"))
              ? "nt authority\\system"
              : "root");
      statement.setString(6, results.getString("asset_executor"));
      statement.setString(7, results.getString("endpoint_agent_version"));
      statement.setTimestamp(8, results.getTimestamp("asset_last_seen"));
      statement.addBatch();
    }
    statement.executeBatch();

    // Remove old columns
    Statement removeColumns = context.getConnection().createStatement();
    removeColumns.execute(
        """
        ALTER TABLE assets DROP COLUMN asset_last_seen;
        ALTER TABLE assets DROP COLUMN asset_executor;
        ALTER TABLE assets DROP COLUMN endpoint_agent_version;
""");
  }
}
