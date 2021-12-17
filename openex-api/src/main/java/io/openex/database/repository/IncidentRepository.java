package io.openex.database.repository;

import io.openex.database.model.Incident;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IncidentRepository extends CrudRepository<Incident, String>, JpaSpecificationExecutor<Incident> {

    @NotNull
    Optional<Incident> findById(@NotNull String id);
}
