package io.openbas.database.model;

import static java.time.Instant.now;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import io.openbas.helper.MultiIdListDeserializer;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

@Data
@Entity
@Table(name = "findings")
@EntityListeners(ModelBaseListener.class)
public class Finding implements Base {

  @Id
  @Column(name = "finding_id", updatable = false, nullable = false)
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("finding_id")
  @NotBlank
  private String id;

  @Column(name = "finding_field", nullable = false)
  @JsonProperty("finding_field")
  @NotBlank
  private String field;

  @Column(name = "finding_type", updatable = false, nullable = false)
  @Enumerated(EnumType.STRING)
  @JsonProperty("finding_type")
  @NotNull
  protected ContractOutputType type;

  @Column(name = "finding_value", nullable = false)
  @JsonProperty("finding_value")
  @NotBlank
  protected String value;

  @Type(StringArrayType.class)
  @Column(name = "finding_labels", columnDefinition = "text[]")
  @JsonProperty("finding_labels")
  private String[] labels;

  // -- RELATION --

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "finding_inject_id")
  @JsonProperty("finding_inject_id")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @Schema(type = "string")
  private Inject inject;

  // -- AUDIT --

  @CreationTimestamp
  @Column(name = "finding_created_at", updatable = false, nullable = false)
  @JsonProperty("finding_created_at")
  @NotNull
  private Instant creationDate = now();

  @UpdateTimestamp
  @Column(name = "finding_updated_at", nullable = false)
  @JsonProperty("finding_updated_at")
  @NotNull
  private Instant updateDate = now();

  // Relation
  @ArraySchema(schema = @Schema(type = "string"))
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "findings_assets",
      joinColumns = @JoinColumn(name = "finding_id"),
      inverseJoinColumns = @JoinColumn(name = "asset_id"))
  @JsonSerialize(using = MultiIdListDeserializer.class)
  @JsonProperty("finding_assets")
  private List<Asset> assets = new ArrayList<>();

  @ArraySchema(schema = @Schema(type = "string"))
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "findings_teams",
      joinColumns = @JoinColumn(name = "finding_id"),
      inverseJoinColumns = @JoinColumn(name = "team_id"))
  @JsonSerialize(using = MultiIdListDeserializer.class)
  @JsonProperty("finding_teams")
  private List<Team> teams = new ArrayList<>();

  @ArraySchema(schema = @Schema(type = "string"))
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "findings_users",
      joinColumns = @JoinColumn(name = "finding_id"),
      inverseJoinColumns = @JoinColumn(name = "user_id"))
  @JsonSerialize(using = MultiIdListDeserializer.class)
  @JsonProperty("finding_users")
  private List<User> users = new ArrayList<>();
}
