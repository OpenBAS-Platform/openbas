package io.openbas.engine.query;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsStructuralSeries {
  private String label;
  private String color;
  private List<EsStructuralSeriesData> data = new ArrayList<>();

  public EsStructuralSeries(String label) {
    this.label = label;
  }

  public EsStructuralSeries(String label, List<EsStructuralSeriesData> data) {
    this.label = label;
    this.data = data;
  }
}
