package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.converter.InjectStatusExecutionConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Setter
@Getter
@Entity
@Table(name = "injects_statuses")
public class InjectStatus extends BaseInjectStatus implements Base {

  public static InjectStatus fromExecution(Execution execution, Inject executedInject) {
    InjectStatus injectStatus = executedInject.getStatus().orElse(new InjectStatus());
    injectStatus.setTrackingSentDate(Instant.now());
    injectStatus.setInject(executedInject);
    injectStatus.getTraces().addAll(execution.getTraces());
    int numberOfElements = execution.getTraces().size();
    int numberOfError = (int) execution.getTraces().stream().filter(ex -> ex.getStatus().equals(ExecutionStatus.ERROR))
        .count();
    int numberOfSuccess = (int) execution.getTraces().stream()
        .filter(ex -> ex.getStatus().equals(ExecutionStatus.SUCCESS)).count();
    injectStatus.setTrackingTotalError(numberOfError);
    injectStatus.setTrackingTotalSuccess(numberOfSuccess);
    injectStatus.setTrackingTotalCount(
        execution.getExpectedCount() != null ? execution.getExpectedCount() : numberOfElements);
    ExecutionStatus globalStatus = numberOfSuccess > 0 ? ExecutionStatus.SUCCESS : ExecutionStatus.ERROR;
    ExecutionStatus finalStatus = numberOfError > 0 && numberOfSuccess > 0 ? ExecutionStatus.PARTIAL : globalStatus;
    injectStatus.setName(execution.isAsync() ? ExecutionStatus.PENDING : finalStatus);
    injectStatus.setTrackingEndDate(Instant.now());
    injectStatus.setTrackingTotalExecutionTime(
        Duration.between(injectStatus.getTrackingSentDate(), injectStatus.getTrackingEndDate()).getSeconds());
    return injectStatus;
  }

  // -- UTILS --

  public static InjectStatus draftInjectStatus() {
    InjectStatus draft = new InjectStatus();
    draft.setName(ExecutionStatus.DRAFT);
    return draft;
  }
}
