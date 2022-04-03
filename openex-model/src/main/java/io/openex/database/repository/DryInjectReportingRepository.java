package io.openex.database.repository;

import io.openex.database.model.DryInjectStatus;
import javax.validation.constraints.NotNull;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DryInjectReportingRepository extends CrudRepository<DryInjectStatus, String> {

    @NotNull
    Optional<DryInjectStatus> findById(@NotNull String id);
}
