package io.openbas.database.repository;

import io.openbas.database.model.Endpoint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
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
          "select e.* from assets e where e.endpoint_mac_addresses && cast(:macAddresses as text[])",
      nativeQuery = true)
  Optional<Endpoint> findByAtleastOneMacAddress(
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
}
