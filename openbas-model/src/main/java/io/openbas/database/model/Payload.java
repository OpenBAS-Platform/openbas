package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.hypersistence.utils.hibernate.type.basic.PostgreSQLHStoreType;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MultiIdDeserializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Setter;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static jakarta.persistence.DiscriminatorType.STRING;
import static java.time.Instant.now;
import static lombok.AccessLevel.NONE;

@Data
@Entity
@Table(name = "payloads")
@EntityListeners(ModelBaseListener.class)
public class Payload implements Base {

  @Id
  @Column(name = "payload_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("payload_id")
  @NotBlank
  private String id;

  @Queryable(searchable = true, filterable = true, sortable = true)
  @Column(name = "payload_type")
  @JsonProperty("payload_type")
  private String type;

  @Queryable(searchable = true, sortable = true)
  @NotBlank
  @Column(name = "payload_name")
  @JsonProperty("payload_name")
  private String name;

  @Column(name = "payload_description")
  @JsonProperty("payload_description")
  private String description;

  @Column(name = "payload_content")
  @JsonProperty("payload_content")
  private String content;

  // -- TAG --

  @Queryable(sortable = true)
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "payloads_tags",
      joinColumns = @JoinColumn(name = "payload_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id"))
  @JsonSerialize(using = MultiIdDeserializer.class)
  @JsonProperty("payload_tags")
  private List<Tag> tags = new ArrayList<>();

  // -- AUDIT --

  @Column(name = "payload_created_at")
  @JsonProperty("payload_created_at")
  private Instant createdAt = now();

  @Column(name = "payload_updated_at")
  @JsonProperty("payload_updated_at")
  private Instant updatedAt = now();
}
