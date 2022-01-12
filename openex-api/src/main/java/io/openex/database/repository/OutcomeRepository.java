package io.openex.database.repository;

import io.openex.database.model.Outcome;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OutcomeRepository extends CrudRepository<Outcome, String>, JpaSpecificationExecutor<Outcome> {

    @NotNull
    Optional<Outcome> findById(@NotNull String id);
}
