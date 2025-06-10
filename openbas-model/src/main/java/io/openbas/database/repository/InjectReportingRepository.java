package io.openbas.database.repository;

import io.openbas.database.model.InjectExecution;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InjectReportingRepository extends CrudRepository<InjectExecution, String> {

  @NotNull
  Optional<InjectExecution> findById(@NotNull String id);
}
