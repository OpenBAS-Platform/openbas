package io.openbas.database.repository;

import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Scenario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface EndpointRepository extends CrudRepository<Endpoint, String>,
    StatisticRepository,
    JpaSpecificationExecutor<Endpoint> {

  @Query(value = "select e.* from assets e where e.endpoint_hostname = :hostname", nativeQuery = true)
  List<Endpoint> findByHostname(@NotBlank final @Param("hostname") String hostname);

  @Query(value = "select e.* from assets e where e.asset_parent is null and e.asset_inject is null and e.endpoint_hostname = :hostname", nativeQuery = true)
  List<Endpoint> findForInjectionByHostname(@NotBlank final @Param("hostname") String hostname);

  @Query(value = "select e.* from assets e where e.asset_parent is not null or e.asset_inject is not null and e.endpoint_hostname = :hostname", nativeQuery = true)
  List<Endpoint> findForExecutionByHostname(@NotBlank final @Param("hostname") String hostname);

  Optional<Endpoint> findByExternalReference(@Param("externalReference") String externalReference);

  @Override
  @Query("select COUNT(DISTINCT a) from Inject i " +
      "join i.assets as a " +
      "join i.exercise as e " +
      "join e.grants as grant " +
      "join grant.group.users as user " +
      "where user.id = :userId and i.createdAt > :creationDate")
  long userCount(@Param("userId") String userId, @Param("creationDate") Instant creationDate);

  @Override
  @Query("select count(distinct e) from Endpoint e where e.createdAt > :creationDate")
  long globalCount(@Param("creationDate") Instant creationDate);

}
