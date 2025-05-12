package io.openbas.engine.api;

import static lombok.AccessLevel.NONE;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import io.swagger.v3.oas.annotations.media.DiscriminatorMapping;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(
    discriminatorProperty = "mode",
    oneOf = {
      DateHistogramWidget.class,
      StructuralHistogramWidget.class,
    },
    discriminatorMapping = {
      @DiscriminatorMapping(
          value = DateHistogramWidget.TEMPORAL_MODE,
          schema = DateHistogramWidget.class),
      @DiscriminatorMapping(
          value = StructuralHistogramWidget.STRUCTURAL_MODE,
          schema = StructuralHistogramWidget.class),
    })
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "mode",
    visible = true)
@JsonSubTypes({
  @JsonSubTypes.Type(value = DateHistogramWidget.class, name = "temporal"),
  @JsonSubTypes.Type(value = StructuralHistogramWidget.class, name = "structural")
})
public abstract class HistogramWidget {

  @Setter(NONE)
  @NotNull
  private final String mode;

  private String title;
  @NotBlank private String field;
  private boolean stacked;

  @JsonProperty("display_legend")
  private boolean displayLegend;

  HistogramWidget(String mode) {
    this.mode = mode;
  }
}
