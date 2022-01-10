package io.openex.database.repository;

import io.openex.database.model.Inject;
import io.openex.database.model.InjectStatus;
import io.openex.model.Execution;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import static java.time.Instant.now;

@Repository
public interface InjectReportingRepository<T> extends CrudRepository<InjectStatus, String> {

    @NotNull
    Optional<InjectStatus> findById(@NotNull String id);

    default void executionSave(Execution execution, Inject<T> inject) {
        InjectStatus injectStatus = new InjectStatus();
        injectStatus.setInject(inject);
        injectStatus.setDate(now());
        injectStatus.setExecutionTime(execution.getExecution());
        injectStatus.setName(execution.getStatus().name());
        injectStatus.setReporting(execution.getReporting());
        save(injectStatus);
    }
}
