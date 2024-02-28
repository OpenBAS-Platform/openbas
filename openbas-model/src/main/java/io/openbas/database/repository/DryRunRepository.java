package io.openbas.database.repository;

import io.openbas.database.model.Dryrun;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DryRunRepository extends CrudRepository<Dryrun, String>, JpaSpecificationExecutor<Dryrun> {

    @NotNull
    Optional<Dryrun> findById(@NotNull String id);
}
