package io.openbas.database.repository;

import io.openbas.database.model.Executor;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExecutorRepository extends CrudRepository<Executor, String> {

    @NotNull
    Optional<Executor> findById(@NotNull String id);

    @NotNull
    Optional<Executor> findByType(@NotNull String type);
}
