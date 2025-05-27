package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Setter
@Getter
@Entity
@Table(
    name = "executions_bindings",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uq_execution_binding_target_source_argument",
            columnNames = {
              "execution_binding_execution_id",
              "execution_binding_source_execution_id",
              "execution_binding_argument_key"
            }))
public class ExecutionBinding {

  @Id
  @Column(name = "execution_binding_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("execution_binding_id")
  private String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "execution_binding_execution_id", nullable = false)
  @JsonIgnore
  private InjectStatus execution;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "execution_binding_source_execution_id", nullable = false)
  @JsonProperty("execution_binding_source_execution")
  private InjectStatus sourceExecution;

  @Column(name = "execution_binding_argument_key", nullable = false)
  @JsonProperty("execution_binding_argument_key")
  private String argumentKey;

  @Column(name = "execution_binding_argument_value", nullable = false)
  @JsonProperty("execution_binding_argument_value")
  private String argumentValue;
}
