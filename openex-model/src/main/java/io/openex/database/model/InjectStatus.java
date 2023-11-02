package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.converter.ExecutionConverter;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.Objects;

import static java.time.Instant.now;

@Entity
@Table(name = "injects_statuses")
public class InjectStatus implements Base {

  @Getter
  @Setter
  @Id
  @Column(name = "status_id")
  @GeneratedValue(generator = "UUID")
  @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
  @JsonProperty("status_id")
  private String id;

  @Getter
  @Setter
  @Column(name = "status_name")
  @JsonProperty("status_name")
  private String name;

  @Getter
  @Setter
  @Column(name = "status_async_id")
  @JsonProperty("status_async_id")
  private String asyncId;

  @Getter
  @Setter
  @Column(name = "status_reporting")
  @Convert(converter = ExecutionConverter.class)
  @JsonProperty("status_reporting")
  private Execution reporting;

  @Getter
  @Setter
  @Column(name = "status_date")
  @JsonProperty("status_date")
  private Instant date;

  @Getter
  @Setter
  @Column(name = "status_execution")
  @JsonProperty("status_execution")
  private Integer executionTime;

  @Getter
  @Setter
  @OneToOne
  @JoinColumn(name = "status_inject")
  @JsonIgnore
  private Inject inject;

  // region transient
  public static InjectStatus fromExecution(Execution execution, Inject inject) {
    InjectStatus injectStatus = new InjectStatus();
    injectStatus.setAsyncId(execution.getAsyncId());
    injectStatus.setInject(inject);
    injectStatus.setDate(now());
    if (execution.isSynchronous()) {
      injectStatus.setExecutionTime(execution.getExecutionTime());
      injectStatus.setName(execution.getStatus().name());
    } else {
      injectStatus.setName(ExecutionStatus.PENDING.name());
    }
    injectStatus.setReporting(execution);
    return injectStatus;
  }
  // endregion

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
