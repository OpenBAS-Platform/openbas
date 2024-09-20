package io.openbas.database.repository;

import io.openbas.database.model.Report;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportRepository extends CrudRepository<Report, UUID>, JpaSpecificationExecutor<Report> {
    @NotNull
    Optional<Report> findById(@NotNull final UUID id);
}
