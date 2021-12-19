package io.openex.database.repository;

import io.openex.database.model.DryInject;
import io.openex.database.model.DryInjectStatus;
import io.openex.model.Execution;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.Optional;

@Repository
public interface DryInjectReportingRepository<T> extends CrudRepository<DryInjectStatus, String> {

    @NotNull
    Optional<DryInjectStatus> findById(@NotNull String id);

    default void executionSave(Execution execution, DryInject<T> inject) {
        DryInjectStatus injectStatus = new DryInjectStatus();
        injectStatus.setDryInject(inject);
        injectStatus.setDate(new Date());
        injectStatus.setExecutionTime(execution.getExecution());
        injectStatus.setName(execution.getStatus().name());
        injectStatus.setReporting(execution.getReporting());
        save(injectStatus);
    }
}
