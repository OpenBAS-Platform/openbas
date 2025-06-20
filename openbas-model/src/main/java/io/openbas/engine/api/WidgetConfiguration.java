package io.openbas.engine.api;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import io.swagger.v3.oas.annotations.media.DiscriminatorMapping;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import static lombok.AccessLevel.NONE;

@Getter
@Setter
@Schema(
        discriminatorProperty = "configurationType",
        oneOf = {
                HistogramWidget.class,
                ListConfiguration.class,
        },
        discriminatorMapping = {
                @DiscriminatorMapping(
                        value = WidgetConfigurationType.Values.LIST,
                        schema = ListConfiguration.class),
                @DiscriminatorMapping(
                        value = WidgetConfigurationType.Values.TEMPORAL_HISTOGRAM,
                        schema = DateHistogramWidget.class),
                @DiscriminatorMapping(
                        value = WidgetConfigurationType.Values.STRUCTURAL_HISTOGRAM,
                        schema = StructuralHistogramWidget.class),
        })
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.EXISTING_PROPERTY,
        property = "configurationType",
        visible = true)
@JsonSubTypes({
        @JsonSubTypes.Type(value = DateHistogramWidget.class, name = WidgetConfigurationType.Values.LIST),
        @JsonSubTypes.Type(value = DateHistogramWidget.class, name = WidgetConfigurationType.Values.TEMPORAL_HISTOGRAM),
        @JsonSubTypes.Type(value = StructuralHistogramWidget.class, name = WidgetConfigurationType.Values.STRUCTURAL_HISTOGRAM)
})
public abstract class WidgetConfiguration {
  @Setter(NONE)
  @NotNull
  private WidgetConfigurationType configurationType;

  private String title;
}
