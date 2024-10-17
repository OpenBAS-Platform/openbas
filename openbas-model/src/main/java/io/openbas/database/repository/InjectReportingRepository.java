package io.openbas.database.repository;

import io.openbas.database.model.InjectStatus;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InjectReportingRepository extends CrudRepository<InjectStatus, String> {

  @NotNull
  Optional<InjectStatus> findById(@NotNull String id);
}
