package io.openbas.engine.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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

  public enum HistogramConfigMode {
    @JsonProperty("structural")
    STRUCTURAL("structural"),
    @JsonProperty("temporal")
    TEMPORAL("temporal");

    public final String mode;

    HistogramConfigMode(@NotNull final String mode) {
      this.mode = mode;
    }
  }

  @NotNull private final HistogramConfigMode mode;
  private String title;
  @NotBlank private String field;
  private boolean stacked;

  @JsonProperty("display_legend")
  private boolean displayLegend;

  HistogramWidget(HistogramConfigMode mode) {
    this.mode = mode;
  }
}
