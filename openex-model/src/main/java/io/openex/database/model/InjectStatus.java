package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import io.openex.database.converter.ExecutionConverter;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.Type;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

import static java.time.Instant.now;

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
  private String name;

  @Column(name = "status_async_ids")
  @JsonProperty("status_async_ids")
  @Type(StringArrayType.class)
  private String[] asyncIds;

  @Column(name = "status_reporting")
  @Convert(converter = ExecutionConverter.class)
  @JsonProperty("status_reporting")
  private Execution reporting;

  @Column(name = "status_date")
  @JsonProperty("status_date")
  private Instant date;

  @Column(name = "status_execution")
  @JsonProperty("status_execution")
  private Integer executionTime;

  @OneToOne
  @JoinColumn(name = "status_inject")
  @JsonIgnore
  private Inject inject;

  // region transient
  public static InjectStatus fromExecution(Execution execution, Inject inject) {
    InjectStatus injectStatus = new InjectStatus();
    injectStatus.setAsyncIds(execution.getAsyncIds());
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
