package io.openbas.engine.query;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsTimeseries {
  private String label;
  private String color;
  private List<EsTimeseriesData> data = new ArrayList<>();

  public EsTimeseries(String label) {
    this.label = label;
  }

  public EsTimeseries(String label, List<EsTimeseriesData> data) {
    this.label = label;
    this.data = data;
  }
}
