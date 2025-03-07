package io.openbas.database.repository;

import io.openbas.database.model.Asset;
import io.openbas.database.model.InjectExpectationTrace;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InjectExpectationTraceRepository
    extends CrudRepository<InjectExpectationTrace, String>,
    JpaSpecificationExecutor<InjectExpectationTrace> {

  @NotNull
  Optional<InjectExpectationTrace> findById(@NotNull String id);

  @Query("select t from InjectExpectationTrace t where t.injectExpectation.id = :expectationId and t.collector.id = :collectorId")
  List<InjectExpectationTrace> findByExpectationAndCollector(@Param("expectationId") final String expectationId,
      @Param("collectorId") final String collectorId);

}
