package io.openbas.rest.report.repository;

import io.openbas.rest.report.model.Report;
import io.openbas.rest.report.model.ReportInjectComment;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportRepository extends CrudRepository<Report, UUID>, JpaSpecificationExecutor<Report> {
    @NotNull
    Optional<Report> findById(@NotNull final UUID id);

    @Query(value = "SELECT injectComment FROM ReportInjectComment injectComment WHERE injectComment.report.id = :reportId AND injectComment.inject.id = :injectId")
    Optional<ReportInjectComment> findReportInjectComment(@NotNull final UUID reportId, @NotNull final String injectId);
}
