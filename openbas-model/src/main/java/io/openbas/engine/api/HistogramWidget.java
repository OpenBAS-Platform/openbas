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
public abstract class HistogramWidget extends WidgetConfiguration {
  @Setter(NONE)
  @NotNull
  private final String mode;

  @NotBlank private String field;
  private boolean stacked;

  @JsonProperty("display_legend")
  private boolean displayLegend;

  HistogramWidget(String mode) {
    this.mode = mode;
  }
}
