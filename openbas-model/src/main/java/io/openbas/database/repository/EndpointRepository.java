package io.openbas.database.repository;

import io.openbas.database.model.Endpoint;
import io.openbas.utils.FilterOption;
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
          "select e.* from assets e where e.endpoint_hostname = :hostname and e.endpoint_platform = :platform and e.endpoint_arch = :arch",
      nativeQuery = true)
  List<Endpoint> findByHostnameArchAndPlatform(
      @NotBlank final @Param("hostname") String hostname,
      @NotBlank final @Param("platform") String platform,
      @NotBlank final @Param("arch") String arch);

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
    SELECT DISTINCT a.asset_id AS id, a.asset_name AS name
    FROM assets a
    WHERE a.asset_id IN (
        SELECT DISTINCT fa.asset_id
        FROM findings f
        LEFT JOIN findings_assets fa ON fa.finding_id = f.finding_id
    ) AND (:name IS NULL OR LOWER(a.asset_name) LIKE LOWER(CONCAT('%', COALESCE(:name, ''), '%')));
    """,
      nativeQuery = true)
  List<FilterOption> findAllByNameLinkedToFindings(@Param("name") String name, Pageable pageable);

  @Query(
      value =
          """
    SELECT DISTINCT a.asset_id AS id, a.asset_name AS name
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
  List<FilterOption> findAllByNameLinkedToFindingsWithContext(
      @Param("sourceId") String sourceId, @Param("name") String name, Pageable pageable);
}
