package io.openbas.database.repository;

import io.openbas.database.model.AssetType;
import io.openbas.database.raw.RawVulnerableEndpoint;
import io.openbas.utils.Constants;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VulnerableEndpointRepository {

  @Query(
      value =
          "SELECT a.asset_id as vulnerable_endpoint_id, "
              + "i.inject_exercise, "
              + "a.endpoint_hostname as vulnerable_endpoint_hostname, "
              + "a.endpoint_platform as vulnerable_endpoint_platform, "
              + "a.endpoint_arch as vulnerable_endpoint_architecture, "
              + "a.asset_created_at as vulnerable_endpoint_created_at, "
              + "a.asset_updated_at as vulnerable_endpoint_updated_at, "
              + "array_agg(fa.finding_id) FILTER ( WHERE fa.finding_id IS NOT NULL ) as vulnerable_endpoint_findings, "
              + "array_agg(at.tag_id) FILTER ( WHERE at.tag_id IS NOT NULL ) as vulnerable_endpoint_tags, "
              + "array_agg(ag.agent_id) FILTER ( WHERE ag.agent_id IS NOT NULL ) as vulnerable_endpoint_agents "
              + "FROM findings f "
              + "JOIN findings_assets fa ON f.finding_id = fa.finding_id "
              + "JOIN assets a ON a.asset_id = fa.asset_id "
              + "JOIN agents ag ON a.asset_id = ag.agent_asset "
              + "LEFT JOIN assets_tags at ON a.asset_id = at.asset_id "
              + "JOIN injects i ON i.inject_id = f.finding_inject_id "
              + "WHERE a.asset_updated_at > :from "
              + "AND a.asset_type = '"
              + AssetType.Values.ENDPOINT_TYPE
              + "' "
              + "GROUP BY a.asset_id, i.inject_exercise, a.asset_updated_at "
              + "ORDER BY a.asset_updated_at LIMIT "
              + Constants.INDEXING_RECORD_SET_SIZE
              + ";",
      nativeQuery = true)
  List<RawVulnerableEndpoint> findForIndexing(@Param("from") Instant from);
}
