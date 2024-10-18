package io.openbas.database.repository;

import io.openbas.database.model.DryInjectStatus;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DryInjectReportingRepository extends CrudRepository<DryInjectStatus, String> {

  @NotNull
  Optional<DryInjectStatus> findById(@NotNull String id);
}
