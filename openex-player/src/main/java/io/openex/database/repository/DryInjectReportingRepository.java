package io.openex.database.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.database.model.DryInject;
import io.openex.database.model.DryInjectStatus;
import io.openex.model.Execution;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.Optional;

@Repository
public interface DryInjectReportingRepository extends CrudRepository<DryInjectStatus, String> {

    @NotNull
    Optional<DryInjectStatus> findById(@NotNull String id);

    default void executionSave(ObjectMapper mapper, Execution execution, DryInject<?> inject) throws JsonProcessingException {
        DryInjectStatus injectStatus = new DryInjectStatus();
        injectStatus.setDryInject(inject);
        injectStatus.setDate(new Date());
        injectStatus.setExecutionTime(execution.getExecution());
        injectStatus.setName(execution.getStatus().name());
        injectStatus.setMessage(mapper.writeValueAsString(execution.getMessage()));
        save(injectStatus);
    }
}
