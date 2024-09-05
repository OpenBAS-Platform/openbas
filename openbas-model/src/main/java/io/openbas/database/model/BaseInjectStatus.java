package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.annotation.Queryable;
import io.openbas.database.converter.InjectStatusExecutionConverter;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Setter
@Getter
@MappedSuperclass
public abstract class BaseInjectStatus implements Base {

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

  @Queryable(searchable = true, path = "inject.title")
  @OneToOne
  @JoinColumn(name = "status_inject")
  @JsonIgnore
  protected Inject inject;

  // region transient
  public List<String> statusIdentifiers() {
    return this.getTraces().stream().flatMap(ex -> ex.getIdentifiers().stream()).toList();
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
