package io.openaev.migration;

import java.sql.PreparedStatement;
import java.util.List;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

/**
 * Rewrites the Splunk ES query template stored on deployed connector instances when it is still one
 * of the defaults the catalog used to prefill, to the query the collector ships today.
 *
 * <p>The catalog prefills {@code SPLUNKES_QUERY_TEMPLATE} with a copy of the collector's default
 * query, and the create form stores that copy on the instance. The Splunk ES collector (3.260917.0
 * and later) only accepts the {@code alerts_index}, {@code source_ips}, {@code target_ips}, {@code
 * hostnames}, {@code start_date} and {@code end_date} placeholders, so both historical defaults
 * ({@code process_conditions}, then {@code implant_urls} / {@code implant_names}) now fail its
 * startup validation: every instance created from the catalog with the default query crash-loops.
 * Fixing the catalog default only helps new instances, hence this migration.
 *
 * <p>Only values equal to a historical default (ignoring surrounding whitespace) are rewritten, so
 * a query the user customized is left untouched. Changing the stored value also changes the
 * instance hash, so XTM Composer redeploys the collector with the new query. Idempotent: a
 * rewritten value no longer matches. Tenant-safe: each row is updated in place and never moves
 * across instances.
 */
@Component
public class V6_20261012160000000__Rewrite_stale_splunk_es_query_template_defaults
    extends BaseJavaMigration {

  // Catalog default from its introduction (#6244) until the implant placeholders (#6306).
  static final String PROCESS_CONDITIONS_DEFAULT =
      "index={alerts_index} (src_ip IN ({source_ips}) OR src IN ({source_ips}) OR source_ip"
          + " IN ({source_ips}) OR client_ip IN ({source_ips})) (dst_ip IN ({target_ips}) OR dest"
          + " IN ({target_ips}) OR dest_ip IN ({target_ips}) OR destination_ip IN ({target_ips}) OR"
          + " server_ip IN ({target_ips})) {process_conditions} earliest={start_date}"
          + " latest={end_date} | table _time, src_ip, src, source_ip, client_ip, dst_ip, dest,"
          + " dest_ip, destination_ip, server_ip, signature, rule_name, event_type, severity,"
          + " url_path, url, path, query, _raw | sort -_time";

  // Catalog default from #6306 until this migration.
  static final String IMPLANT_PLACEHOLDERS_DEFAULT =
      "index={alerts_index} (src_ip IN ({source_ips}) OR src IN ({source_ips}) OR source_ip"
          + " IN ({source_ips}) OR client_ip IN ({source_ips})) (dst_ip IN ({target_ips}) OR dest"
          + " IN ({target_ips}) OR dest_ip IN ({target_ips}) OR destination_ip IN ({target_ips}) OR"
          + " server_ip IN ({target_ips})) (url_path IN ({implant_urls}) OR url IN ({implant_urls})"
          + " OR path IN ({implant_urls}) OR query IN ({implant_urls}) OR process_name IN"
          + " ({implant_names}) OR parent_process_name IN ({implant_names})) earliest={start_date}"
          + " latest={end_date} | table _time, src_ip, src, source_ip, client_ip, dst_ip, dest,"
          + " dest_ip, destination_ip, server_ip, signature, rule_name, event_type, severity,"
          + " url_path, url, path, query, process_name, parent_process_name, _raw | sort -_time";

  // Splunk ES collector built-in default since 3.260917.0, mirrored in catalog-integrators.json.
  static final String CURRENT_DEFAULT =
      "index={alerts_index} (src_ip IN ({source_ips}) OR src IN ({source_ips}) OR source_ip"
          + " IN ({source_ips}) OR client_ip IN ({source_ips})) (dst_ip IN ({target_ips}) OR dest"
          + " IN ({target_ips}) OR dest_ip IN ({target_ips}) OR destination_ip IN ({target_ips}) OR"
          + " server_ip IN ({target_ips})) (host IN ({hostnames}) OR hostname IN ({hostnames}) OR"
          + " host_name IN ({hostnames})) earliest={start_date} latest={end_date} | table _time,"
          + " src_ip, src, source_ip, client_ip, dst_ip, dest, dest_ip, destination_ip, server_ip,"
          + " host, hostname, signature, rule_name, event_type, severity, url_path, _raw | sort"
          + " -_time";

  @Override
  public void migrate(Context context) throws Exception {
    try (PreparedStatement statement =
        context
            .getConnection()
            .prepareStatement(
                "UPDATE connector_instance_configurations "
                    + "SET connector_instance_configuration_value = to_jsonb(?::text), "
                    + "connector_instance_updated_at = now() "
                    + "WHERE connector_instance_configuration_key = 'SPLUNKES_QUERY_TEMPLATE' "
                    + "AND connector_instance_configuration_is_encrypted IS NOT TRUE "
                    + "AND jsonb_typeof(connector_instance_configuration_value) = 'string' "
                    + "AND btrim(connector_instance_configuration_value #>> '{}', E' \\t\\r\\n') = ?")) {
      for (String staleDefault :
          List.of(PROCESS_CONDITIONS_DEFAULT, IMPLANT_PLACEHOLDERS_DEFAULT)) {
        statement.setString(1, CURRENT_DEFAULT);
        statement.setString(2, staleDefault);
        statement.addBatch();
      }
      statement.executeBatch();
    }
  }
}
