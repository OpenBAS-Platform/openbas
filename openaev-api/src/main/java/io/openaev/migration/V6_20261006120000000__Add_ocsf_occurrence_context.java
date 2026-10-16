package io.openaev.migration;

import java.sql.Statement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

/**
 * OCSF occurrence context (US.2.0 "Input OCSF becomes an actionable object"):
 *
 * <ul>
 *   <li>scanner product and version ({@code metadata.product.name} / {@code .version}),
 *   <li>additional links ({@code unmapped.additional_urls}) and scanner labels ({@code
 *       resources[].labels}, {@code cloud.account.labels}),
 *   <li>cloud Locations become {@code provider/account/region/resource} instead of the bare
 *       resource identifier, so the same resource id in two accounts or regions is two Locations.
 * </ul>
 *
 * <p>Existing RESOURCE occurrences are rewritten from the provider, account and region already
 * stored on the row; missing segments are written as {@code -}, matching live ingestion. Their
 * scanner, links and labels are backfilled from the stored raw OCSF payload and resource snapshot
 * (label Tags are only created by the next ingestion).
 */
@Component
public class V6_20261006120000000__Add_ocsf_occurrence_context extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    try (Statement statement = context.getConnection().createStatement()) {
      statement.execute(
          """
          ALTER TABLE finding_occurrences
              ADD COLUMN IF NOT EXISTS finding_occurrence_source_product VARCHAR(255),
              ADD COLUMN IF NOT EXISTS finding_occurrence_source_version VARCHAR(255),
              ADD COLUMN IF NOT EXISTS finding_occurrence_additional_urls TEXT[],
              ADD COLUMN IF NOT EXISTS finding_occurrence_labels TEXT[];
          """);
      statement.execute(
          """
          WITH prefixed AS (
              SELECT finding_occurrence_id,
                     concat_ws('/',
                         coalesce(nullif(lower(trim(finding_occurrence_resource_provider)), ''), '-'),
                         coalesce(nullif(trim(finding_occurrence_resource_account), ''), '-'),
                         coalesce(nullif(trim(finding_occurrence_resource_region), ''), '-')) AS prefix
              FROM finding_occurrences
              WHERE finding_occurrence_location_type = 'RESOURCE'
                AND finding_occurrence_location_key IS NOT NULL
          )
          UPDATE finding_occurrences o
          SET finding_occurrence_location_key = lower(p.prefix || '/' || o.finding_occurrence_location_key),
              finding_occurrence_location =
                  p.prefix || '/' || coalesce(o.finding_occurrence_location, o.finding_occurrence_location_key)
          FROM prefixed p
          WHERE o.finding_occurrence_id = p.finding_occurrence_id
            AND o.finding_occurrence_location_key NOT LIKE lower(p.prefix) || '/%';
          """);
      // Only RESOURCE occurrences come from OCSF, whose raw payload and resource snapshot are the
      // JSON serialization of the callback record, so the casts below are safe.
      statement.execute(
          """
          UPDATE finding_occurrences o
          SET finding_occurrence_source_product =
                  o.finding_occurrence_raw_payload::jsonb #>> '{metadata,product,name}',
              finding_occurrence_source_version =
                  o.finding_occurrence_raw_payload::jsonb #>> '{metadata,product,version}',
              finding_occurrence_additional_urls = ARRAY(
                  SELECT jsonb_array_elements_text(
                      CASE WHEN jsonb_typeof(o.finding_occurrence_raw_payload::jsonb
                                    #> '{unmapped,additional_urls}') = 'array'
                           THEN o.finding_occurrence_raw_payload::jsonb #> '{unmapped,additional_urls}'
                           ELSE '[]'::jsonb END)),
              finding_occurrence_labels = ARRAY(
                  SELECT DISTINCT label FROM (
                      SELECT jsonb_array_elements_text(
                          CASE WHEN jsonb_typeof(o.finding_occurrence_raw_payload::jsonb
                                        #> '{cloud,account,labels}') = 'array'
                               THEN o.finding_occurrence_raw_payload::jsonb #> '{cloud,account,labels}'
                               ELSE '[]'::jsonb END) AS label
                      UNION ALL
                      SELECT jsonb_array_elements_text(
                          CASE WHEN o.finding_occurrence_resource_snapshot IS NOT NULL
                                    AND jsonb_typeof(o.finding_occurrence_resource_snapshot::jsonb
                                        -> 'labels') = 'array'
                               THEN o.finding_occurrence_resource_snapshot::jsonb -> 'labels'
                               ELSE '[]'::jsonb END)) labels)
          WHERE o.finding_occurrence_location_type = 'RESOURCE'
            AND o.finding_occurrence_raw_payload IS NOT NULL
            AND o.finding_occurrence_source_product IS NULL;
          """);
    }
  }
}
