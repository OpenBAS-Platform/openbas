package io.openbas.database.repository;

import io.openbas.database.model.Scenario;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScenarioRepository extends CrudRepository<Scenario, String> {

  @Query("select distinct s from Scenario s " +
      "join s.grants as grant " +
      "join grant.group.users as user " +
      "where user.id = :userId")
  List<Scenario> findAllGranted(@Param("userId") String userId);

}
