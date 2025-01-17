package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import java.time.Duration;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;

@Setter
@Getter
@Entity
@Table(name = "injects_statuses")
public class InjectStatus extends BaseInjectStatus {

  // commands lines tracking
  @Type(JsonType.class)
  @Column(name = "status_payload_output", columnDefinition = "json")
  @JsonProperty("status_payload_output")
  private StatusPayload payloadOutput;

  public static InjectStatus fromExecution(Execution execution, Inject executedInject) {
    InjectStatus injectStatus = executedInject.getStatus().orElse(new InjectStatus());
    injectStatus.setTrackingSentDate(Instant.now());
    injectStatus.setInject(executedInject);
    injectStatus.getTraces().addAll(execution.getTraces());
    int numberOfElements = execution.getTraces().size();
    int numberOfError =
        (int)
            execution.getTraces().stream()
                .filter(ex -> ExecutionTraceStatus.ERROR.equals(ex.getStatus()))
                .count();
    int numberOfSuccess =
        (int)
            execution.getTraces().stream()
                .filter(ex -> ExecutionTraceStatus.SUCCESS.equals(ex.getStatus()))
                .count();
    injectStatus.setTrackingTotalError(numberOfError);
    injectStatus.setTrackingTotalSuccess(numberOfSuccess);
    injectStatus.setTrackingTotalCount(
        execution.getExpectedCount() != null ? execution.getExpectedCount() : numberOfElements);
    ExecutionStatus globalStatus =
        numberOfSuccess > 0 ? ExecutionStatus.SUCCESS : ExecutionStatus.ERROR;
    ExecutionStatus finalStatus =
        numberOfError > 0 && numberOfSuccess > 0 ? ExecutionStatus.PARTIAL : globalStatus;
    injectStatus.setName(execution.isAsync() ? ExecutionStatus.PENDING : finalStatus);
    injectStatus.setTrackingEndDate(Instant.now());
    injectStatus.setTrackingTotalExecutionTime(
        Duration.between(injectStatus.getTrackingSentDate(), injectStatus.getTrackingEndDate())
            .getSeconds());
    return injectStatus;
  }
}
