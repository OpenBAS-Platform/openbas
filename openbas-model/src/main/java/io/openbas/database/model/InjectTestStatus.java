package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.converter.InjectStatusExecutionConverter;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Setter
@Getter
@Entity
@Table(name = "injects_tests_statuses")
public class InjectTestStatus implements Base {

  @Id
  @Column(name = "status_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("status_id")
  private String id;

  @Column(name = "status_name")
  @JsonProperty("status_name")
  @Enumerated(EnumType.STRING)
  @NotNull
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
  @JoinColumn(name = "status_inject_inject_id")
  @JsonIgnore
  private Inject inject;

  @JsonProperty("inject_title")
  public String getInjectTitle() {
    return inject.getTitle();
  }

  @JsonProperty("injector_contract")
  public Optional<InjectorContract> getInjectContract() {
    return inject.getInjectorContract();
  }

  @JsonProperty("inject_type")
  private String getType() {
    return inject.getInjectorContract()
        .map(InjectorContract::getInjector)
        .map(Injector::getType)
        .orElse(null);
  }

  @CreationTimestamp
  @Column(name = "status_created_at")
  @JsonProperty("inject_test_status_created_at")
  private Instant testCreationDate;

  @UpdateTimestamp
  @Column(name = "status_updated_at")
  @JsonProperty("inject_test_status_updated_at")
  private Instant testUpdateDate;

  // region transient
  public List<String> statusIdentifiers() {
    return this.getTraces().stream().flatMap(ex -> ex.getIdentifiers().stream()).toList();
  }
  // endregion

  public static InjectTestStatus fromExecutionTest(Execution execution) {
    InjectTestStatus injectTestStatus = new InjectTestStatus();
    injectTestStatus.setTrackingSentDate(Instant.now());
    injectTestStatus.getTraces().addAll(execution.getTraces());
    int numberOfElements = execution.getTraces().size();
    int numberOfError = (int) execution.getTraces().stream().filter(ex -> ex.getStatus().equals(ExecutionStatus.ERROR))
        .count();
    int numberOfSuccess = (int) execution.getTraces().stream()
        .filter(ex -> ex.getStatus().equals(ExecutionStatus.SUCCESS)).count();
    injectTestStatus.setTrackingTotalError(numberOfError);
    injectTestStatus.setTrackingTotalSuccess(numberOfSuccess);
    injectTestStatus.setTrackingTotalCount(
        execution.getExpectedCount() != null ? execution.getExpectedCount() : numberOfElements);
    ExecutionStatus globalStatus = numberOfSuccess > 0 ? ExecutionStatus.SUCCESS : ExecutionStatus.ERROR;
    ExecutionStatus finalStatus = numberOfError > 0 && numberOfSuccess > 0 ? ExecutionStatus.PARTIAL : globalStatus;
    injectTestStatus.setName(execution.isAsync() ? ExecutionStatus.PENDING : finalStatus);
    injectTestStatus.setTrackingEndDate(Instant.now());
    injectTestStatus.setTrackingTotalExecutionTime(
        Duration.between(injectTestStatus.getTrackingSentDate(), injectTestStatus.getTrackingEndDate()).getSeconds());
    return injectTestStatus;
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


}