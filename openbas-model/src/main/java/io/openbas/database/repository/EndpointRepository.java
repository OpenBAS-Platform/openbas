package io.openbas.database.repository;

import io.openbas.database.model.AssetType;
import io.openbas.database.model.Endpoint;
import io.openbas.database.raw.RawEndpoint;
import io.openbas.utils.Constants;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EndpointRepository
    extends CrudRepository<Endpoint, String>,
        StatisticRepository,
        JpaSpecificationExecutor<Endpoint> {

  @Query(
      value =
          "select e.* from assets e where e.endpoint_hostname = :hostname and e.endpoint_platform = :platform and e.endpoint_arch = :arch and e.endpoint_ips && cast(:ips as text[])",
      nativeQuery = true)
  List<Endpoint> findByHostnameAndAtleastOneIp(
      @NotBlank final @Param("hostname") String hostname,
      @NotBlank final @Param("platform") String platform,
      @NotBlank final @Param("arch") String arch,
      @NotNull final @Param("ips") String[] ips);

  @Query(
      value =
          "select e.* from assets e where e.endpoint_mac_addresses && cast(:macAddresses as text[]) order by e.asset_id",
      nativeQuery = true)
  List<Endpoint> findByAtleastOneMacAddress(
      @NotNull final @Param("macAddresses") String[] macAddresses);

  @Override
  @Query(
      "select COUNT(DISTINCT a) from Inject i "
          + "join i.assets as a "
          + "join i.exercise as e "
          + "join e.grants as grant "
          + "join grant.group.users as user "
          + "where user.id = :userId and i.createdAt > :creationDate")
  long userCount(@Param("userId") String userId, @Param("creationDate") Instant creationDate);

  @Override
  @Query("select count(distinct e) from Endpoint e where e.createdAt > :creationDate")
  long globalCount(@Param("creationDate") Instant creationDate);

  @Query(
      "SELECT a FROM Inject i"
          + " JOIN i.assets a"
          + " WHERE ("
          + "   :simulationOrScenarioId is NULL AND i.exercise.id is NULL AND i.scenario.id IS NULL"
          + "   OR (i.exercise.id = :simulationOrScenarioId"
          + "   OR i.scenario.id = :simulationOrScenarioId)"
          + " ) AND (:name IS NULL OR lower(a.name) LIKE lower(concat('%', cast(coalesce(:name, '') as string), '%')))")
  List<Endpoint> findAllBySimulationOrScenarioIdAndName(String simulationOrScenarioId, String name);

  @Query(
      value =
          """
    SELECT DISTINCT a.asset_id AS id, a.asset_name AS label
    FROM assets a
    WHERE a.asset_id IN (
        SELECT DISTINCT fa.asset_id
        FROM findings f
        LEFT JOIN findings_assets fa ON fa.finding_id = f.finding_id
    ) AND (:name IS NULL OR LOWER(a.asset_name) LIKE LOWER(CONCAT('%', COALESCE(:name, ''), '%')));
    """,
      nativeQuery = true)
  List<Object[]> findAllByNameLinkedToFindings(@Param("name") String name, Pageable pageable);

  @Query(
      value =
          """
    SELECT DISTINCT a.asset_id AS id, a.asset_name AS label
    FROM assets a
    WHERE a.asset_id IN (
        SELECT DISTINCT fa2.asset_id
        FROM findings_assets fa1
        INNER JOIN findings f ON f.finding_id = fa1.finding_id
        INNER JOIN findings_assets fa2 ON f.finding_id = fa2.finding_id
        INNER JOIN injects i ON f.finding_inject_id = i.inject_id
        LEFT JOIN scenarios_exercises se ON se.exercise_id = i.inject_exercise
        WHERE (
            fa1.asset_id = :sourceId
            OR i.inject_id = :sourceId
            OR i.inject_exercise = :sourceId
            OR se.scenario_id = :sourceId
        )
        AND fa2.asset_id != :sourceId
    )
    AND (:name IS NULL OR LOWER(a.asset_name) LIKE LOWER(CONCAT('%', COALESCE(:name, ''), '%')));
    """,
      nativeQuery = true)
  List<Object[]> findAllByNameLinkedToFindingsWithContext(
      @Param("sourceId") String sourceId, @Param("name") String name, Pageable pageable);

  @Query(
      value =
          "SELECT a.asset_id, a.asset_type, a.asset_name, a.asset_external_reference, "
              + "a.endpoint_ips, a.endpoint_hostname, a.endpoint_platform, a.endpoint_arch, "
              + "a.endpoint_mac_addresses, a.endpoint_seen_ip, a.asset_created_at, a.asset_updated_at, "
              + "a.endpoint_is_eol, a.asset_description, "
              + "array_agg(fa.finding_id) FILTER ( WHERE fa.finding_id IS NOT NULL ) as asset_findings, "
              + "array_agg(at.tag_id) FILTER ( WHERE at.tag_id IS NOT NULL ) as asset_tags "
              + "FROM assets a "
              + "LEFT JOIN findings_assets fa ON a.asset_id = fa.asset_id "
              + "LEFT JOIN assets_tags at ON a.asset_id = at.asset_id "
              + "WHERE a.asset_updated_at > :from AND a.asset_type = '"
              + AssetType.Values.ENDPOINT_TYPE
              + "' "
              + "GROUP BY a.asset_id, a.asset_updated_at "
              + "ORDER BY a.asset_updated_at LIMIT "
              + Constants.INDEXING_RECORD_SET_SIZE
              + ";",
      nativeQuery = true)
  List<RawEndpoint> findForIndexing(@Param("from") Instant from);

  List<Endpoint> findDistinctByInjectsScenarioId(String scenarioId);

  List<Endpoint> findDistinctByInjectsExerciseId(String exerciseId);
}
