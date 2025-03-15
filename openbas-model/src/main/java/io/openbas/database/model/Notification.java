package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.List;

import static java.time.Instant.now;

@Data
@Entity
@Table(name = "notifications")
@EntityListeners(ModelBaseListener.class)
public class Notification implements Base {

  @Id
  @Column(name = "notification_id", updatable = false, nullable = false)
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("notification_id")
  @NotBlank
  private String id;

  @Column(name = "notification_name", nullable = false)
  @JsonProperty("notification_name")
  @NotBlank
  private String name;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "notification_user")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("notification_user")
  @Schema(type = "string")
  private User user;

  @Type(JsonType.class)
  @Column(name = "notification_filter")
  @JsonProperty("notification_filter")
  private Filters.FilterGroup filter;

  @Type(StringArrayType.class)
  @Column(name = "notification_outcomes", columnDefinition = "text[]")
  @JsonProperty("notification_outcomes")
  private String[] outcomes;

  @Type(StringArrayType.class)
  @Column(name = "notification_event_types", columnDefinition = "text[]")
  @JsonProperty("notification_event_types")
  private String[] eventTypes;

  // -- AUDIT --

  @Queryable(filterable = true, sortable = true)
  @CreationTimestamp
  @Column(name = "notification_created_at", updatable = false, nullable = false)
  @JsonProperty("notification_created_at")
  @NotNull
  private Instant creationDate = now();

  @Queryable(filterable = true, sortable = true)
  @UpdateTimestamp
  @Column(name = "notification_updated_at", nullable = false)
  @JsonProperty("notification_updated_at")
  @NotNull
  private Instant updateDate = now();

}
