package io.openex.database.repository;

import io.openex.database.model.Pause;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PauseRepository extends CrudRepository<Pause, String>, JpaSpecificationExecutor<Pause> {

    @NotNull
    Optional<Pause> findById(@NotNull String id);
}
