package io.openbas.database.repository;

import io.openbas.database.model.Scenario;
import io.openbas.database.raw.RawScenario;
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
public interface ScenarioRepository extends CrudRepository<Scenario, String>,
    StatisticRepository,
    JpaSpecificationExecutor<Scenario> {

  @NotNull
  Optional<Scenario> findByExternalReference(@Param("externalReference") String externalReference);

  @Query("select distinct s from Scenario s " +
      "join s.grants as grant " +
      "join grant.group.users as user " +
      "where user.id = :userId")
  List<Scenario> findAllGranted(@Param("userId") String userId);

  @Override
  @Query("select count(distinct u) from User u " +
      "join u.teams as team " +
      "join team.scenarios as s " +
      "join s.grants as grant " +
      "join grant.group.users as user " +
      "where user.id = :userId and u.createdAt < :creationDate")
  long userCount(String userId, Instant creationDate);

  @Override
  @Query("select count(distinct s) from Scenario s where s.createdAt < :creationDate")
  long globalCount(@Param("creationDate") Instant creationDate);

  @Query(value = "SELECT scenario_category, COUNT(*) AS category_count " +
      "FROM scenarios " +
      "GROUP BY scenario_category " +
      "ORDER BY category_count DESC " +
      "LIMIT :limit", nativeQuery = true)
  List<Object[]> findTopCategories(@Param("limit") @NotNull final int limit);

  @Query(value = "SELECT sce.scenario_id, sce.scenario_name, sce.scenario_subtitle, array_agg(sct.tag_id) FILTER (WHERE sct.tag_id IS NOT NULL) as scenario_tags " +
          "FROM scenarios sce " +
          "LEFT JOIN scenarios_tags sct ON sct.scenario_id = sce.scenario_id " +
          "INNER join grants ON grants.grant_scenario = sce.scenario_id " +
          "INNER join groups ON grants.grant_group = groups.group_id " +
          "INNER JOIN users_groups ON groups.group_id = users_groups.group_id " +
          "WHERE users_groups.user_id = :userId " +
          "GROUP BY sce.scenario_id", nativeQuery = true)
  List<RawScenario> rawAllGranted(@Param("userId") String userId);


  @Query(value = "SELECT sce.scenario_id, sce.scenario_name, sce.scenario_subtitle, array_agg(sct.tag_id) FILTER (WHERE sct.tag_id IS NOT NULL) as scenario_tags " +
          "FROM scenarios sce " +
          "LEFT JOIN scenarios_tags sct ON sct.scenario_id = sce.scenario_id " +
          "GROUP BY sce.scenario_id", nativeQuery = true)
  List<RawScenario> rawAll();

}
