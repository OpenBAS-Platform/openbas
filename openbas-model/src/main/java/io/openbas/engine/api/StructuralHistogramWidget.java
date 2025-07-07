package io.openbas.engine.api;

import static io.openbas.config.EngineConfig.Defaults.ENTITIES_CAP;

import io.openbas.database.model.Filters;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StructuralHistogramWidget extends HistogramWidget {

  public static final String STRUCTURAL_MODE = "structural";

  @Positive
  @Min(1)
  private int limit = ENTITIES_CAP;

  @NotNull List<StructuralHistogramSeries> series = new ArrayList<>();

  @Data
  public static class StructuralHistogramSeries {
    private String name;
    private Filters.FilterGroup filter = new Filters.FilterGroup();
  }

  public StructuralHistogramWidget() {
    super(STRUCTURAL_MODE);
  }
}
