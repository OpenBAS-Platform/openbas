package io.openbas.database.repository;

import io.openbas.database.model.InjectStatus;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InjectReportingRepository extends CrudRepository<InjectStatus, String> {

    @NotNull
    Optional<InjectStatus> findById(@NotNull String id);
}
