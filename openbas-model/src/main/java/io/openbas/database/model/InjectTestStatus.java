package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.Duration;
import java.util.Optional;

@Setter
@Getter
@Entity
@Table(name = "injects_tests_statuses")
public class InjectTestStatus extends BaseInjectStatus implements Base {

  @JsonProperty("inject_id")
  public String getInjectId() {
    return inject.getId();
  }

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


}
