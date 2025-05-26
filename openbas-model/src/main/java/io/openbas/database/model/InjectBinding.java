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
    name = "injects_bindings",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uq_inject_binding_target_source_key",
            columnNames = {
              "inject_parent_id",
              "inject_children_id",
              "inject_binding_source_key",
              "inject_binding_target_key"
            }))
public class InjectBinding {

  @Id
  @Column(name = "inject_binding_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("inject_binding_id")
  private String id;

  // Composite foreign key to InjectDependency
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumns({
    @JoinColumn(
        name = "inject_binding_inject_parent_id",
        referencedColumnName = "inject_parent_id"),
    @JoinColumn(
        name = "inject_binding_inject_children_id",
        referencedColumnName = "inject_children_id")
  })
  private InjectDependency injectDependency;

  @Column(name = "inject_binding_source_key", nullable = false)
  private String sourceKey;

  @Column(name = "inject_binding_target_key", nullable = false)
  private String targetKey;
}
