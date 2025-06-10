package io.openbas.database.repository;

import io.openbas.database.model.InjectExecution;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InjectExecutionRepository
    extends CrudRepository<InjectExecution, String>, JpaSpecificationExecutor<InjectExecution> {

  @NotNull
  Optional<InjectExecution> findById(@NotNull String id);

  @Query(
      value =
          "select c from InjectExecution c where c.name = 'PENDING' and c.inject.injectorContract.injector.type = :injectType")
  List<InjectExecution> pendingForInjectType(@Param("injectType") String injectType);

  Optional<InjectExecution> findByInjectId(@NotNull String injectId);

  @Query(
      value =
          "SELECT ins.*, t.*"
              + " FROM injects_executions ins"
              + " INNER JOIN injects i ON ins.status_inject = i.inject_id"
              + " LEFT JOIN execution_traces t"
              + "  ON t.execution_inject_status_id = ins.status_id"
              + "  AND t.execution_agent_id IS NULL"
              + "  AND cardinality(t.execution_context_identifiers) = 0"
              + " WHERE i.inject_id = :injectId",
      nativeQuery = true)
  Optional<InjectExecution> findInjectStatusWithGlobalExecutionTraces(String injectId);
}
