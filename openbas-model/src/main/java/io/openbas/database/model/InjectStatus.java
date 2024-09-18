package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.converter.InjectStatusCommandLineConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Duration;
import java.time.Instant;

@Setter
@Getter
@Entity
@Table(name = "injects_statuses")
public class InjectStatus extends BaseInjectStatus {

  // commands lines tracking
  @Column(name = "status_commands_lines")
  @Convert(converter = InjectStatusCommandLineConverter.class)
  @JsonProperty("status_commands_lines")
  private InjectStatusCommandLine commandsLines;

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
