package io.openbas.database.repository;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectTestExecution;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;

public interface InjectTestStatusRepository
    extends CrudRepository<InjectTestExecution, String>,
        JpaSpecificationExecutor<InjectTestExecution> {

  @NotNull
  Optional<InjectTestExecution> findById(@NotNull String id);

  Optional<InjectTestExecution> findByInject(@NotNull Inject inject);
}
