package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import io.openbas.helper.MultiIdListDeserializer;
import io.openbas.helper.MultiIdSetDeserializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import static jakarta.persistence.DiscriminatorType.STRING;
import static java.time.Instant.now;
import static lombok.AccessLevel.NONE;

@Data
@Entity
@Table(name = "assets")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "asset_type", discriminatorType = STRING)
@EntityListeners(ModelBaseListener.class)
public class Asset implements Base {

  public static final int ACTIVE_THRESHOLD = 1800000; // 3 minutes

  @Id
  @Column(name = "asset_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("asset_id")
  @NotBlank
  private String id;

  @Column(name = "asset_type", insertable = false, updatable = false)
  @JsonProperty("asset_type")
  @Setter(NONE)
  private String type;

  @Queryable(searchable = true, sortable = true)
  @Column(name = "asset_name")
  @JsonProperty("asset_name")
  @NotBlank
  private String name;

  @Queryable(sortable = true)
  @Column(name = "asset_description")
  @JsonProperty("asset_description")
  private String description;

  @Column(name = "asset_last_seen")
  @JsonProperty("asset_last_seen")
  private Instant lastSeen;

  @Column(name = "asset_external_reference")
  @JsonProperty("asset_external_reference")
  private String externalReference;

  @Column(name = "asset_process_name")
  @JsonProperty("asset_process_name")
  private String processName;

  @Column(name = "asset_cleared_at")
  @JsonProperty("asset_cleared_at")
  private Instant clearedAt = now();

  // -- TAG --

  @Queryable(filterable = true, sortable = true, dynamicValues = true, path = "tags.id")
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "assets_tags",
      joinColumns = @JoinColumn(name = "asset_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id"))
  @JsonSerialize(using = MultiIdSetDeserializer.class)
  @JsonProperty("asset_tags")
  private Set<Tag> tags = new HashSet<>();

  @Queryable(sortable = true)
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "asset_executor")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("asset_executor")
  private Executor executor;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "asset_parent")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("asset_parent")
  private Asset parent;

  @OneToMany(fetch = FetchType.EAGER)
  @JoinColumn(name = "asset_parent")
  @JsonSerialize(using = MultiIdListDeserializer.class)
  @JsonProperty("asset_children")
  private List<Asset> children;

  @OneToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "asset_inject")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("asset_inject")
  private Inject inject;

  @JsonProperty("asset_active")
  public boolean getActive() {
    return this.getLastSeen() != null && (now().toEpochMilli() - this.getLastSeen().toEpochMilli()) < ACTIVE_THRESHOLD;
  }

  // -- AUDIT --

  @Column(name = "asset_created_at")
  @JsonProperty("asset_created_at")
  @NotNull
  private Instant createdAt = now();

  @Column(name = "asset_updated_at")
  @JsonProperty("asset_updated_at")
  @NotNull
  private Instant updatedAt = now();

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  public Asset() {

  }

  public Asset(String id, String type, String name) {
    this.name = name;
    this.id = id;
    this.type = type;
  }
}
