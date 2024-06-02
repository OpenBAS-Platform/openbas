package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MultiIdListDeserializer;
import io.openbas.helper.MultiIdSetDeserializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Setter;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.*;

import static jakarta.persistence.DiscriminatorType.STRING;
import static java.time.Instant.now;
import static lombok.AccessLevel.NONE;

@Data
@Entity
@Table(name = "payloads")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "payload_type", discriminatorType = STRING)
@EntityListeners(ModelBaseListener.class)
public class Payload implements Base {

  @Id
  @Column(name = "payload_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("payload_id")
  @NotBlank
  private String id;

  @Column(name = "payload_type", insertable = false, updatable = false)
  @JsonProperty("payload_type")
  @Setter(NONE)
  private String type;

  @Queryable(searchable = true, sortable = true)
  @NotBlank
  @Column(name = "payload_name")
  @JsonProperty("payload_name")
  private String name;

  @Column(name = "payload_description")
  @JsonProperty("payload_description")
  private String description;

  @Type(StringArrayType.class)
  @Column(name = "payload_platforms", columnDefinition = "text[]")
  @JsonProperty("payload_platforms")
  private String[] platforms = new String[0];

  @Setter
  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(name = "payloads_attack_patterns",
          joinColumns = @JoinColumn(name = "payload_id"),
          inverseJoinColumns = @JoinColumn(name = "attack_pattern_id"))
  @JsonSerialize(using = MultiIdListDeserializer.class)
  @JsonProperty("payload_attack_patterns")
  @Queryable(searchable = true, filterable = true, property = "externalId")
  private List<AttackPattern> attackPatterns = new ArrayList<>();

  @Setter
  @Column(name = "payload_cleanup_executor")
  @JsonProperty("payload_cleanup_executor")
  private String cleanupExecutor;

  @Setter
  @Column(name = "payload_cleanup_command")
  @JsonProperty("payload_cleanup_command")
  private String cleanupCommand;

  @Setter
  @Type(JsonType.class)
  @Column(name = "payload_arguments")
  @JsonProperty("payload_arguments")
  private List<PayloadArgument> arguments = new ArrayList<>();

  @Setter
  @Type(JsonType.class)
  @Column(name = "payload_prerequisites")
  @JsonProperty("payload_prerequisites")
  private List<PayloadPrerequisite> prerequisites = new ArrayList<>();

  // -- TAG --

  @Queryable(sortable = true)
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "payloads_tags",
      joinColumns = @JoinColumn(name = "payload_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id"))
  @JsonSerialize(using = MultiIdSetDeserializer.class)
  @JsonProperty("payload_tags")
  private Set<Tag> tags = new HashSet<>();

  // -- AUDIT --

  @Column(name = "payload_created_at")
  @JsonProperty("payload_created_at")
  private Instant createdAt = now();

  @Column(name = "payload_updated_at")
  @JsonProperty("payload_updated_at")
  private Instant updatedAt = now();

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  public Payload() {

  }

  public Payload(String id, String type, String name) {
    this.name = name;
    this.id = id;
    this.type = type;
  }
}
