package io.openex.database.repository;

import io.openex.database.model.Report;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import java.util.Optional;

@Repository
public interface ReportRepository extends CrudRepository<Report, String>, JpaSpecificationExecutor<Report> {

    @NotNull
    Optional<Report> findById(@NotNull String id);
}
