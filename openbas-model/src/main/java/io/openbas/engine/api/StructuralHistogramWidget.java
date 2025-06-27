package io.openbas.engine.api;

import io.openbas.database.model.Filters;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StructuralHistogramWidget extends HistogramWidget {

  public static final String STRUCTURAL_MODE = "structural";

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
