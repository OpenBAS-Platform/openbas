package io.openbas.database.model;

import static java.time.Instant.now;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

@Data
@Entity
@Table(name = "custom_dashboards")
@EntityListeners(ModelBaseListener.class)
public class CustomDashboard implements Base {

  @Id
  @Column(name = "custom_dashboard_id", updatable = false, nullable = false)
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("custom_dashboard_id")
  @NotBlank
  private String id;

  @Column(name = "custom_dashboard_name", nullable = false)
  @JsonProperty("custom_dashboard_name")
  @NotBlank
  @Queryable(filterable = true, searchable = true, sortable = true)
  private String name;

  @Column(name = "custom_dashboard_description")
  @JsonProperty("custom_dashboard_description")
  private String description;

  @Type(JsonType.class)
  @Column(name = "custom_dashboard_content", columnDefinition = "JSONB")
  @JsonProperty("custom_dashboard_content")
  private String content;

  // -- AUDIT --

  @CreationTimestamp
  @Column(name = "custom_dashboard_created_at", updatable = false, nullable = false)
  @JsonProperty("custom_dashboard_created_at")
  @NotNull
  private Instant creationDate = now();

  @UpdateTimestamp
  @Column(name = "custom_dashboard_updated_at", nullable = false)
  @JsonProperty("custom_dashboard_updated_at")
  @NotNull
  private Instant updateDate = now();
}
