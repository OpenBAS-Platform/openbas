package io.openbas.database.repository;

import io.openbas.database.model.Endpoint;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface EndpointRepository extends CrudRepository<Endpoint, String>,
    StatisticRepository,
    JpaSpecificationExecutor<Endpoint> {

  @Query(value = "select e.* from assets e where e.asset_sources[:sourceKey] IS NOT NULL AND e.endpoint_hostname = :hostname", nativeQuery = true)
  List<Endpoint> findBySourceAndHostname(
      @NotBlank final @Param("sourceKey") String sourceKey,
      @NotBlank final @Param("hostname") String hostname
  );

  @Override
  @Query("select COUNT(DISTINCT a) from Inject i " +
      "join i.assets as a " +
      "join i.exercise as e " +
      "join e.grants as grant " +
      "join grant.group.users as user " +
      "where user.id = :userId and i.createdAt < :creationDate")
  long userCount(@Param("userId") String userId, @Param("creationDate") Instant creationDate);

  @Override
  @Query("select count(distinct e) from Endpoint e where e.createdAt < :creationDate")
  long globalCount(@Param("creationDate") Instant creationDate);

}
