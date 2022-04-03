package io.openex.database.repository;

import io.openex.database.model.Objective;
import javax.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ObjectiveRepository extends CrudRepository<Objective, String>, JpaSpecificationExecutor<Objective> {

    @NotNull
    Optional<Objective> findById(@NotNull String id);
}
