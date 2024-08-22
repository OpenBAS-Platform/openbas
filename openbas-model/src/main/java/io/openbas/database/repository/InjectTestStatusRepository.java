package io.openbas.database.repository;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectTestStatus;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;

public interface InjectTestStatusRepository extends CrudRepository<InjectTestStatus, String>,
    JpaSpecificationExecutor<InjectTestStatus> {

  @NotNull
  Optional<InjectTestStatus> findById(@NotNull String id);

  Optional<InjectTestStatus> findByInject(@NotNull Inject inject);
  

  @Query(value = "select its.* from injects_tests_statuses its inner join injects i on its.status_inject = i.inject_id where i.inject_scenario = :scenarioId", nativeQuery = true)
  List<InjectTestStatus> findAllScenarioInjectTests(@Param("scenarioId") String scenarioId);
}
