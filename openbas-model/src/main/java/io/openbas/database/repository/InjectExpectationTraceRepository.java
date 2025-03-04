package io.openbas.database.repository;

import io.openbas.database.model.InjectExpectationTrace;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InjectExpectationTraceRepository
    extends CrudRepository<InjectExpectationTrace, String>,
        JpaSpecificationExecutor<InjectExpectationTrace> {

  @NotNull
  Optional<InjectExpectationTrace> findById(@NotNull String id);
}
