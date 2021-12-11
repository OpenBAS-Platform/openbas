package io.openex.player.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.player.model.database.Inject;
import io.openex.player.model.database.InjectStatus;
import io.openex.player.model.execution.Execution;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.Optional;

@Repository
public interface InjectReportingRepository extends CrudRepository<InjectStatus, String> {

    Optional<InjectStatus> findById(String id);

    default InjectStatus executionSave(ObjectMapper mapper, Execution execution, Inject<?> inject) throws JsonProcessingException {
        InjectStatus injectStatus = new InjectStatus();
        injectStatus.setInject(inject);
        injectStatus.setDate(new Date());
        injectStatus.setExecutionTime(execution.getExecution());
        injectStatus.setName(execution.getStatus().name());
        injectStatus.setMessage(mapper.writeValueAsString(execution.getMessage()));
        return save(injectStatus);
    }
}
