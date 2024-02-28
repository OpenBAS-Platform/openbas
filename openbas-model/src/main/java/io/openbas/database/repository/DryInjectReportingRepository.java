package io.openbas.database.repository;

import io.openbas.database.model.DryInjectStatus;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DryInjectReportingRepository extends CrudRepository<DryInjectStatus, String> {

    @NotNull
    Optional<DryInjectStatus> findById(@NotNull String id);
}
