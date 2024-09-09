package io.openbas.database.repository;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectTestStatus;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface InjectTestStatusRepository extends CrudRepository<InjectTestStatus, String>,
    JpaSpecificationExecutor<InjectTestStatus> {

  @NotNull
  Optional<InjectTestStatus> findById(@NotNull String id);

  Optional<InjectTestStatus> findByInject(@NotNull Inject inject);

}
