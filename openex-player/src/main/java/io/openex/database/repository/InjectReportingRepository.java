package io.openex.database.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.database.model.Inject;
import io.openex.database.model.InjectStatus;
import io.openex.model.Execution;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.Optional;

@Repository
public interface InjectReportingRepository extends CrudRepository<InjectStatus, String> {

    @NotNull
    Optional<InjectStatus> findById(@NotNull String id);

    default void executionSave(ObjectMapper mapper, Execution execution, Inject<?> inject) throws JsonProcessingException {
        InjectStatus injectStatus = new InjectStatus();
        injectStatus.setInject(inject);
        injectStatus.setDate(new Date());
        injectStatus.setExecutionTime(execution.getExecution());
        injectStatus.setName(execution.getStatus().name());
        injectStatus.setMessage(mapper.writeValueAsString(execution.getMessage()));
        save(injectStatus);
    }
}
