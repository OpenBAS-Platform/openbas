package io.openex.database.repository;

import io.openex.database.model.InjectStatus;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InjectReportingRepository extends CrudRepository<InjectStatus, String> {

    @NotNull
    Optional<InjectStatus> findById(@NotNull String id);
}
