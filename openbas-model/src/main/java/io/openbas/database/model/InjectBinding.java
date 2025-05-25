package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Setter
@Getter
@Entity
@Table(
    name = "inject_bindings",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uq_target_source_key",
            columnNames = {
              "inject_binding_target_inject_id",
              "inject_binding_source_inject_id",
              "inject_binding_argument_key"
            }))
public class InjectBinding {

  @Id
  @Column(name = "inject_binding_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("inject_binding_id")
  private String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "inject_binding_target_inject_id", nullable = false)
  private Inject targetInject;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "inject_binding_source_inject_id", nullable = false)
  private Inject sourceInject;

  @Column(name = "inject_binding_argument_key", nullable = false)
  private String argumentKey;

  @Column(name = "inject_binding_argument_value", nullable = false)
  private String argumentValue;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "inject_binding_status_id", nullable = false)
  private InjectStatus injectStatus;
}
