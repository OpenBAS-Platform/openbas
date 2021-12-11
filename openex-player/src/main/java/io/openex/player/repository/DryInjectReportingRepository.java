package io.openex.player.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.player.model.database.DryInject;
import io.openex.player.model.database.DryInjectStatus;
import io.openex.player.model.database.InjectStatus;
import io.openex.player.model.execution.Execution;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.Optional;

@Repository
public interface DryInjectReportingRepository extends CrudRepository<DryInjectStatus, String> {

    Optional<DryInjectStatus> findById(String id);

    default DryInjectStatus executionSave(ObjectMapper mapper, Execution execution, DryInject<?> inject) throws JsonProcessingException {
        DryInjectStatus injectStatus = new DryInjectStatus();
        injectStatus.setDryInject(inject);
        injectStatus.setDate(new Date());
        injectStatus.setExecutionTime(execution.getExecution());
        injectStatus.setName(execution.getStatus().name());
        injectStatus.setMessage(mapper.writeValueAsString(execution.getMessage()));
        return save(injectStatus);
    }
}
