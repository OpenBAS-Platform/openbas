package io.openbas.database.repository;

import io.openbas.database.model.AssetType;
import io.openbas.database.model.Endpoint;
import io.openbas.database.raw.RawVulnerableEndpoint;
import io.openbas.utils.Constants;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VulnerableEndpointRepository extends JpaRepository<Endpoint, String> {

  @Query(
      value =
          "SELECT CONCAT(a.asset_id, '_', i.inject_exercise) as base_id, "
              + "a.asset_id as vulnerable_endpoint_id, "
              + "i.inject_exercise as vulnerable_endpoint_simulation, "
              + "a.endpoint_hostname as vulnerable_endpoint_hostname, "
              + "a.endpoint_platform as vulnerable_endpoint_platform, "
              // FIXME: hook to the real eol flag when available
              + "false as vulnerable_endpoint_eol, "
              + "a.endpoint_arch as vulnerable_endpoint_architecture, "
              + "e.exercise_created_at as vulnerable_endpoint_created_at, "
              + "e.exercise_updated_at as vulnerable_endpoint_updated_at, "
              + "array_agg(fa.finding_id) FILTER ( WHERE fa.finding_id IS NOT NULL ) as vulnerable_endpoint_findings, "
              + "array_agg(distinct at.tag_id) FILTER ( WHERE at.tag_id IS NOT NULL ) as vulnerable_endpoint_tags, "
              + "array_agg(distinct ag.agent_id) FILTER ( WHERE ag.agent_id IS NOT NULL ) as vulnerable_endpoint_agents, "

              // denormalised
              + "array_agg(f.finding_id) FILTER ( WHERE f.finding_id IS NOT NULL AND f.finding_type = 'CVE' ) as vulnerable_endpoint_cves, "
              + "array_agg(ag.agent_last_seen) FILTER ( WHERE ag.agent_id IS NOT NULL ) as vulnerable_endpoint_agents_last_seen, "
              + "array_agg(distinct ag.agent_privilege) FILTER ( WHERE ag.agent_id IS NOT NULL ) as vulnerable_endpoint_agents_privileges "
              + "FROM findings f "
              + "JOIN findings_assets fa ON f.finding_id = fa.finding_id "
              + "JOIN assets a ON a.asset_id = fa.asset_id "
              + "LEFT JOIN agents ag ON a.asset_id = ag.agent_asset "
              + "LEFT JOIN assets_tags at ON a.asset_id = at.asset_id "
              + "JOIN injects i ON i.inject_id = f.finding_inject_id "
              + "JOIN exercises e ON i.inject_exercise = e.exercise_id "
              + "WHERE e.exercise_updated_at > :from "
              + "AND a.asset_type = '"
              + AssetType.Values.ENDPOINT_TYPE
              + "' "
              + "GROUP BY a.asset_id, i.inject_exercise, e.exercise_updated_at, e.exercise_created_at "
              + "ORDER BY e.exercise_updated_at LIMIT "
              + Constants.INDEXING_RECORD_SET_SIZE
              + ";",
      nativeQuery = true)
  List<RawVulnerableEndpoint> findForIndexing(@Param("from") Instant from);
}
