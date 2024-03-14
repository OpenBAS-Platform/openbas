package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

public class V2_75__Add_tag_unique_index extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    try (Statement statement = connection.createStatement()) {
      // Create temporary table for uniq tags
      statement.executeUpdate("""
            CREATE TABLE uniq_tags AS
            SELECT MIN(tag_id) AS uniq_id, tag_name
            FROM tags
            GROUP BY tag_name
            HAVING COUNT(*) > 1;
          """);

      // Deduplicate tag in other tables
      deduplicateInTable(statement, "asset_groups_tags", "asset_group_id");
      deduplicateInTable(statement, "assets_tags", "asset_id");
      deduplicateInTable(statement, "challenges_tags", "challenge_id");
      deduplicateInTable(statement, "documents_tags", "document_id");
      deduplicateInTable(statement, "exercises_tags", "exercise_id");
      deduplicateInTable(statement, "injects_tags", "inject_id");
      deduplicateInTable(statement, "logs_tags", "log_id");
      deduplicateInTable(statement, "organizations_tags", "organization_id");
      deduplicateInTable(statement, "scenarios_tags", "scenario_id");
      deduplicateInTable(statement, "teams_tags", "team_id");
      deduplicateInTable(statement, "users_tags", "user_id");

      // Remove duplicate tags in tags table
      statement.executeUpdate("""
            DELETE FROM tags
            WHERE tag_id NOT IN (SELECT uniq_id FROM uniq_tags);
          """);

      // Add unicity
      statement.executeUpdate("""
            CREATE UNIQUE INDEX IF NOT EXISTS tag_name_unique ON tags (tag_name);
          """);

      // Remove temporary table
      statement.executeUpdate("""
            DROP TABLE IF EXISTS uniq_tags;
          """);
    }
  }

  private static void deduplicateInTable(Statement statement, String table, String keyId) throws SQLException {
    // Set uniq tag
    statement.executeUpdate("""
        UPDATE """ + " ".concat(table).concat(" ") + """
        tableName
        SET tag_id = uniq_tag.uniq_id
        FROM uniq_tags uniq_tag
        JOIN tags t ON uniq_tag.tag_name = t.tag_name
        WHERE tableName.tag_id = t.tag_id
          AND t.tag_id NOT IN (SELECT uniq_id FROM uniq_tags)
          AND NOT EXISTS (
            SELECT 1
            FROM """ + " ".concat(table).concat(" ") + """
            tableName2
            WHERE tableName2.tag_id = uniq_tag.uniq_id
              AND tableName2.""" + " ".concat(keyId).concat(" ") + """
                = tableName.""" + " ".concat(keyId).concat(" ") + """
          );
        """);
  }
}
