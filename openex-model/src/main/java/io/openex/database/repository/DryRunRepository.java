package io.openex.database.repository;

import io.openex.database.model.Dryrun;
import javax.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DryRunRepository extends CrudRepository<Dryrun, String>, JpaSpecificationExecutor<Dryrun> {

    @NotNull
    Optional<Dryrun> findById(@NotNull String id);
}
