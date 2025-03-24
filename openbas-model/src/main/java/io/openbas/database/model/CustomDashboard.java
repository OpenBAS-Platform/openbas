package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MultiModelDeserializer;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.List;

import static jakarta.persistence.FetchType.LAZY;
import static java.time.Instant.now;

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

  @OneToMany(mappedBy = "customDashboard", fetch = LAZY)
  @JsonProperty("custom_dashboard_widgets")
  @JsonSerialize(using = MultiModelDeserializer.class)
  @ArraySchema(schema = @Schema(type = "string"))
  private List<Widget> widgets;

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
