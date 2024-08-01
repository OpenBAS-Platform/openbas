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
public class InjectStatus implements Base {

  @Id
  @Column(name = "status_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("status_id")
  private String id;

  @Column(name = "status_name")
  @JsonProperty("status_name")
  @Enumerated(EnumType.STRING)
  private ExecutionStatus name;

  // region dates tracking
  @Column(name = "status_executions")
  @Convert(converter = InjectStatusExecutionConverter.class)
  @JsonProperty("status_traces")
  private List<InjectStatusExecution> traces = new ArrayList<>();

  @Column(name = "tracking_sent_date")
  @JsonProperty("tracking_sent_date")
  private Instant trackingSentDate; // To Queue / processing engine

  @Column(name = "tracking_ack_date")
  @JsonProperty("tracking_ack_date")
  private Instant trackingAckDate; // Ack from remote injector

  @Column(name = "tracking_end_date")
  @JsonProperty("tracking_end_date")
  private Instant trackingEndDate; // Done task from injector

  @Column(name = "tracking_total_execution_time")
  @JsonProperty("tracking_total_execution_time")
  private Long trackingTotalExecutionTime;
  // endregion

  // region count
  @Column(name = "tracking_total_count")
  @JsonProperty("tracking_total_count")
  private Integer trackingTotalCount;

  @Column(name = "tracking_total_error")
  @JsonProperty("tracking_total_error")
  private Integer trackingTotalError;

  @Column(name = "tracking_total_success")
  @JsonProperty("tracking_total_success")
  private Integer trackingTotalSuccess;
  // endregion

  @OneToOne
  @JoinColumn(name = "status_inject")
  @JsonIgnore
  private Inject inject;

  // region transient
  public List<String> statusIdentifiers() {
    return this.getTraces().stream().flatMap(ex -> ex.getIdentifiers().stream()).toList();
  }
  // endregion

  public static InjectStatus fromExecution(Execution execution, Inject executedInject) {
    InjectStatus injectStatus = executedInject.getStatus().orElse(new InjectStatus());
    injectStatus.setInject(executedInject);
    return fromExecution(execution, injectStatus);
  }

  public static InjectStatus fromExecutionTest(Execution execution) {
    InjectStatus injectStatus = new InjectStatus();
    return fromExecution(execution, injectStatus);
  }

  private static InjectStatus fromExecution(Execution execution, InjectStatus injectStatus) {
    injectStatus.setTrackingSentDate(Instant.now());
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

  @Override
  public boolean isUserHasAccess(User user) {
    return this.inject.isUserHasAccess(user);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || !Base.class.isAssignableFrom(o.getClass())) {
      return false;
    }
    Base base = (Base) o;
    return id.equals(base.getId());
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  // -- UTILS --

  public static InjectStatus draftInjectStatus() {
    InjectStatus draft = new InjectStatus();
    draft.setName(ExecutionStatus.DRAFT);
    return draft;
  }
}
