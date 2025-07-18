package io.openbas.engine.api.configuration;

import static lombok.AccessLevel.NONE;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import io.openbas.engine.api.configuration.list.ListConfiguration;
import io.swagger.v3.oas.annotations.media.DiscriminatorMapping;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(
    discriminatorProperty = "widget_configuration_type",
    oneOf = {
      HistogramConfiguration.class,
      ListConfiguration.class,
    },
    discriminatorMapping = {
      @DiscriminatorMapping(
          value = WidgetConfigurationType.Values.LIST,
          schema = ListConfiguration.class),
      @DiscriminatorMapping(
          value = WidgetConfigurationType.Values.TEMPORAL_HISTOGRAM,
          schema = DateHistogramConfiguration.class),
      @DiscriminatorMapping(
          value = WidgetConfigurationType.Values.STRUCTURAL_HISTOGRAM,
          schema = StructuralHistogramConfiguration.class),
    })
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "widget_configuration_type",
    visible = true)
@JsonSubTypes({
  @JsonSubTypes.Type(value = ListConfiguration.class, name = WidgetConfigurationType.Values.LIST),
  @JsonSubTypes.Type(
      value = DateHistogramConfiguration.class,
      name = WidgetConfigurationType.Values.TEMPORAL_HISTOGRAM),
  @JsonSubTypes.Type(
      value = StructuralHistogramConfiguration.class,
      name = WidgetConfigurationType.Values.STRUCTURAL_HISTOGRAM)
})
public abstract class WidgetConfiguration {
  @Setter(NONE)
  @NotNull
  @JsonProperty("widget_configuration_type")
  private WidgetConfigurationType configurationType;

  @JsonProperty("title")
  private String title;

  protected WidgetConfiguration(WidgetConfigurationType configurationType) {
    this.configurationType = configurationType;
  }
}
