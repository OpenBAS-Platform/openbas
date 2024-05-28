package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import io.openbas.helper.MultiIdDeserializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

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

  public static final int ACTIVE_THRESHOLD = 300000; // milliseconds

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
  @NotBlank
  @Column(name = "asset_name")
  @JsonProperty("asset_name")
  private String name;

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

  @Queryable(sortable = true)
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "assets_tags",
      joinColumns = @JoinColumn(name = "asset_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id"))
  @JsonSerialize(using = MultiIdDeserializer.class)
  @JsonProperty("asset_tags")
  private List<Tag> tags = new ArrayList<>();

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
  @JsonSerialize(using = MultiIdDeserializer.class)
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
  private Instant createdAt = now();

  @Column(name = "asset_updated_at")
  @JsonProperty("asset_updated_at")
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
