package io.openbas.database.repository;

import io.openbas.database.model.ContractOutputType;
import io.openbas.database.model.Finding;
import io.openbas.database.raw.RawFinding;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FindingRepository
    extends CrudRepository<Finding, String>, JpaSpecificationExecutor<Finding> {

  List<Finding> findAllByInjectId(@NotNull final String injectId);

  @Query(
      value =
          "SELECT f FROM Finding f WHERE f.execution.id = :executionId AND f.value = :value AND f.type = :type AND f.field = :key")
  Optional<Finding> findByExecutionIdAndValueAndTypeAndKey(
      @NotBlank @Param("executionId") String executionId,
      @NotBlank @Param("value") String value,
      @NotNull @Param("type") ContractOutputType type,
      @NotBlank @Param("key") String key);

  // -- INDEXING --

  @Query(
      value =
          "SELECT f.finding_id, f.finding_value, f.finding_type, f.finding_field,"
              + " f.finding_inject_id, se.scenario_id, f.finding_created_at, f.finding_updated_at "
              + "FROM findings f "
              + "LEFT JOIN injects i ON i.inject_id = f.finding_inject_id "
              + "LEFT JOIN scenarios_exercises se ON i.inject_exercise = se.exercise_id "
              + "WHERE f.finding_updated_at > :from ORDER BY f.finding_updated_at LIMIT 500;",
      nativeQuery = true)
  List<RawFinding> findForIndexing(@Param("from") Instant from); // TODO POC ES
}
