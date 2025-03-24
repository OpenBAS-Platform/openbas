package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.hypersistence.utils.hibernate.type.json.JsonType;
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
@Table(name = "widgets")
@EntityListeners(ModelBaseListener.class)
public class Widget implements Base {

  public enum WidgetType {
    @JsonProperty("vertical-barchart")
    VERTICAL_BAR_CHART("vertical-barchart");

    public final String type;

    WidgetType(@NotNull final String type) {
      this.type = type;
    }
  }

  @Id
  @Column(name = "widget_id", updatable = false, nullable = false)
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("widget_id")
  @NotBlank
  private String id;

  @Column(name = "widget_type", updatable = false, nullable = false)
  @Enumerated(EnumType.STRING)
  @JsonProperty("widget_type")
  @NotNull
  protected WidgetType type;

  @Type(JsonType.class)
  @Column(name = "widget_data_selections", columnDefinition = "JSONB")
  @JsonProperty("widget_data_selections")
  @NotNull
  private List<WidgetDataSelection> dataSelections;

  @Type(JsonType.class)
  @Column(name = "widget_parameters", columnDefinition = "JSONB")
  @JsonProperty("widget_parameters")
  @NotNull
  private WidgetParameters parameters;

  @Type(JsonType.class)
  @Column(name = "widget_layout", columnDefinition = "JSONB")
  @JsonProperty("widget_layout")
  private WidgetLayout layout;

  // -- RELATIONS --

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "widget_custom_dashboard")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("widget_custom_dashboard")
  @Schema(type = "string")
  private CustomDashboard customDashboard;

  // -- AUDIT --

  @CreationTimestamp
  @Column(name = "widget_created_at", updatable = false, nullable = false)
  @JsonProperty("widget_created_at")
  @NotNull
  private Instant creationDate = now();

  @UpdateTimestamp
  @Column(name = "widget_updated_at", nullable = false)
  @JsonProperty("widget_updated_at")
  @NotNull
  private Instant updateDate = now();
}
