package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

public class V3_72__Add_FKs_jointure_tables_to_tags extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    try (Statement statement = connection.createStatement()) {

      // Recreate primary constraint
      recreateForeingConstraints(
          statement, "asset_groups_tags", "asset_groups_tags_pkey", "asset_group_id");
      recreateForeingConstraints(statement, "assets_tags", "assets_tags_pkey", "asset_id");
      recreateForeingConstraints(
          statement, "challenges_tags", "challenges_tags_pkey", "challenge_id");
      recreateForeingConstraints(statement, "documents_tags", "documents_tags_pkey", "document_id");
      recreateForeingConstraints(statement, "exercises_tags", "exercises_tags_pkey", "exercise_id");
      recreateForeingConstraints(statement, "injects_tags", "injects_tags_pkey", "inject_id");
      recreateForeingConstraints(statement, "logs_tags", "logs_tags_pkey", "log_id");
      recreateForeingConstraints(
          statement, "organizations_tags", "organizations_tags_pkey", "organization_id");
      recreateForeingConstraints(statement, "scenarios_tags", "scenarios_tags_pkey", "scenario_id");
      recreateForeingConstraints(statement, "teams_tags", "teams_tags_pkey", "team_id");
      recreateForeingConstraints(statement, "users_tags", "users_tags_pkey", "user_id");
    }
  }

  private static void recreateForeingConstraints(
      Statement statement, String table, String constraintKey, String key) throws SQLException {
    // Add primary key
    statement.executeUpdate(
        """
        ALTER TABLE """
            + " ".concat(table).concat(" ")
            + """
          ADD CONSTRAINT """
            + " ".concat(constraintKey).concat(" ")
            + """
          FOREIGN KEY (
            """
            + " ".concat(key).concat(" ")
            + """
            , tag_id
            );
        """);

    //ALTER TABLE injects_assets ADD CONSTRAINT asset_id_fk FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE;

  }
}
