package io.openbas.utilstest;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import io.openbas.config.EngineConfig;
import java.util.*;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class DatabaseSnapshotManager {

  private final JdbcTemplate jdbcTemplate;
  private static Map<String, List<Map<String, Object>>> startupData = new HashMap<>();
  private static boolean snapshotCreated = false;
  @Autowired private ElasticsearchClient esClient;
  @Autowired private EngineConfig config;

  public DatabaseSnapshotManager(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void onApplicationReady() {
    createStartupSnapshot();
  }

  public void createStartupSnapshot() {
    synchronized (DatabaseSnapshotManager.class) {
      if (snapshotCreated) return;

      try {
        List<String> tables =
            jdbcTemplate.queryForList(
                "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
                String.class);

        for (String table : tables) {
          List<Map<String, Object>> tableData = jdbcTemplate.queryForList("SELECT * FROM " + table);
          startupData.put(table, new ArrayList<>(tableData));
        }

        snapshotCreated = true;
        log.info("Startup snapshot created with JDBC ({} tables)", startupData.size());

      } catch (Exception e) {
        log.error("Failed to create startup snapshot: {}", e.getMessage(), e);
      }
    }
  }

  public void restoreToStartupState() {
    if (!snapshotCreated) {
      log.error("Snapshot not created yet, cannot restore!");
      return;
    }

    try {
      // Get tables order
      List<String> tablesInOrder = getTablesInDependencyOrder();

      cleanElasticsearchIndices();

      // Deactivate FK for now
      jdbcTemplate.execute("SET session_replication_role = 'replica';");

      // Empty tables
      List<String> reverseOrder = new ArrayList<>(tablesInOrder);
      Collections.reverse(reverseOrder);
      for (String table : reverseOrder) {
        jdbcTemplate.execute("DELETE FROM " + table);
      }

      // Restore tables in the correct order
      for (String table : tablesInOrder) {
        restoreTableData(table);
      }

      // Activate FK back
      jdbcTemplate.execute("SET session_replication_role = 'origin';");

      log.info("Database restored to startup state via JDBC");

    } catch (Exception e) {
      throw new RuntimeException("Error restoring startup state", e);
    }
  }

  private void cleanElasticsearchIndices() {
    if (esClient == null) {
      return;
    }

    try {
      esClient
          .indices()
          .delete(
              d ->
                  d.index(config.getIndexPrefix() + "_*")
                      .ignoreUnavailable(true)
                      .allowNoIndices(true));
      log.info("Deleted all openbas_* Elasticsearch indices");
    } catch (Exception e) {
      log.warn("Could not clean Elasticsearch: {}", e.getMessage());
    }
  }

  private List<String> getTablesInDependencyOrder() {
    return jdbcTemplate.queryForList(
        """
        WITH table_deps AS (
            SELECT
                t.table_name,
                COUNT(rc.constraint_name) as fk_count
            FROM information_schema.tables t
            LEFT JOIN information_schema.key_column_usage kcu
                ON t.table_name = kcu.table_name AND t.table_schema = kcu.table_schema
            LEFT JOIN information_schema.referential_constraints rc
                ON kcu.constraint_name = rc.constraint_name
            WHERE t.table_schema = 'public'
            GROUP BY t.table_name
        )
        SELECT table_name
        FROM table_deps
        ORDER BY fk_count, table_name
        """,
        String.class);
  }

  private void restoreTableData(String table) {
    List<Map<String, Object>> data = startupData.get(table);
    if (data == null || data.isEmpty()) return;

    for (Map<String, Object> row : data) {
      String columns = String.join(", ", row.keySet());
      String placeholders = row.keySet().stream().map(k -> "?").collect(Collectors.joining(", "));

      String sql = "INSERT INTO " + table + " (" + columns + ") VALUES (" + placeholders + ")";
      jdbcTemplate.update(sql, row.values().toArray());
    }
  }
}
