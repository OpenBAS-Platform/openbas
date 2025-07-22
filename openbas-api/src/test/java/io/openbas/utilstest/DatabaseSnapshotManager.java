package io.openbas.utilstest;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import io.openbas.config.EngineConfig;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class DatabaseSnapshotManager {

  private final JdbcTemplate jdbcTemplate;
  private final ElasticsearchClient esClient;
  private final EngineConfig config;

  private static final Map<String, List<Map<String, Object>>> startupData = new HashMap<>();
  private static final List<String> TABLE_WITHOUT_RESTORATION = List.of("indexing_status");

  private static boolean snapshotCreated = false;

  /** Create a snapshot of the database at startup */
  @EventListener(ApplicationReadyEvent.class)
  public void onApplicationReady() {
    createSnapshot();
  }

  /** Create a snapshot of the database */
  public void createSnapshot() {
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

  /** Restore database to the snapshot */
  public void restoreToSnapshotState() {
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
        if (!TABLE_WITHOUT_RESTORATION.contains(table)) {
          restoreTableData(table);
        }
      }

      // Activate FK back
      jdbcTemplate.execute("SET session_replication_role = 'origin';");

      log.info("Database restored to startup state via JDBC");

    } catch (Exception e) {
      throw new RuntimeException("Error restoring startup state", e);
    }
  }

  /** Delete ES indices */
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

  /**
   * Get the list of tables in dependency order
   *
   * @return the list of tables in dependency order
   */
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

  /**
   * Restore the data of a specific table
   *
   * @param table the table to restore
   */
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
