package io.openex.database.repository;

import io.openex.database.model.IncidentType;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IncidentTypeRepository extends CrudRepository<IncidentType, String>, JpaSpecificationExecutor<IncidentType> {

    @NotNull
    Optional<IncidentType> findById(@NotNull String id);
}
