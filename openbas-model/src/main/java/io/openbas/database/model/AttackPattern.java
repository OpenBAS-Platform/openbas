package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import io.openbas.helper.MultiIdListDeserializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static java.time.Instant.now;

@Data
@Entity
@Table(name = "attack_patterns")
@EntityListeners(ModelBaseListener.class)
public class AttackPattern implements Base {

  @Id
  @Column(name = "attack_pattern_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("attack_pattern_id")
  @NotBlank
  private String id;

  @Column(name = "attack_pattern_stix_id")
  @JsonProperty("attack_pattern_stix_id")
  @NotBlank
  private String stixId;

  @Queryable(searchable = true, sortable = true)
  @Column(name = "attack_pattern_name")
  @JsonProperty("attack_pattern_name")
  @NotBlank
  private String name;

  @Queryable(searchable = true)
  @Column(name = "attack_pattern_description")
  @JsonProperty("attack_pattern_description")
  private String description;

  @Queryable(searchable = true, sortable = true)
  @Column(name = "attack_pattern_external_id")
  @JsonProperty("attack_pattern_external_id")
  @NotBlank
  private String externalId;

  @Column(name = "attack_pattern_platforms", columnDefinition = "text[]")
  @JsonProperty("attack_pattern_platforms")
  private String[] platforms = new String[0];

  @Column(name = "attack_pattern_permissions_required", columnDefinition = "text[]")
  @JsonProperty("attack_pattern_permissions_required")
  private String[] permissionsRequired = new String[0];

  @Queryable(sortable = true)
  @Column(name = "attack_pattern_created_at")
  @JsonProperty("attack_pattern_created_at")
  private Instant createdAt = now();

  @Queryable(sortable = true)
  @Column(name = "attack_pattern_updated_at")
  @JsonProperty("attack_pattern_updated_at")
  private Instant updatedAt = now();

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "attack_pattern_parent")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("attack_pattern_parent")
  private AttackPattern parent;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "attack_patterns_kill_chain_phases",
      joinColumns = @JoinColumn(name = "attack_pattern_id"),
      inverseJoinColumns = @JoinColumn(name = "phase_id"))
  @JsonSerialize(using = MultiIdListDeserializer.class)
  @JsonProperty("attack_pattern_kill_chain_phases")
  private List<KillChainPhase> killChainPhases = new ArrayList<>();

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
