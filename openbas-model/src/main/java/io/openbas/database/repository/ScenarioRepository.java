package io.openbas.database.repository;

import io.openbas.database.model.Scenario;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface ScenarioRepository extends CrudRepository<Scenario, String>,
    StatisticRepository,
    JpaSpecificationExecutor<Scenario> {

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

}
