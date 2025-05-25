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
    name = "inject_mappings",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uq_dependency_output_input",
            columnNames = {
              "inject_parent_id",
              "inject_children_id",
              "inject_mapping_source_key",
              "inject_mapping_target_key"
            }))
public class InjectMapping {

  @Id
  @Column(name = "inject_mapping_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("inject_mapping_id")
  private String id;

  // Composite foreign key to InjectDependency
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumns({
    @JoinColumn(
        name = "inject_mapping_inject_parent_id",
        referencedColumnName = "inject_parent_id"),
    @JoinColumn(
        name = "inject_mapping_inject_children_id",
        referencedColumnName = "inject_children_id")
  })
  private InjectDependency injectDependency;

  @Column(name = "inject_mapping_source_key", nullable = false)
  private String sourceKey;

  @Column(name = "inject_mapping_target_key", nullable = false)
  private String targetKey;
}
