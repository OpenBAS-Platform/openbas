package io.openbas.database.repository;

import io.openbas.database.model.Dryrun;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DryRunRepository
    extends CrudRepository<Dryrun, String>, JpaSpecificationExecutor<Dryrun> {

  @NotNull
  Optional<Dryrun> findById(@NotNull String id);
}
