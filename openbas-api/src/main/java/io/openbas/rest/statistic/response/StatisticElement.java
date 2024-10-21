package io.openbas.rest.statistic.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class StatisticElement {
  @JsonProperty("global_count")
  private long global;

  @JsonProperty("progression_count")
  private long progression;

  public StatisticElement(long global, long progression) {
    this.global = global;
    this.progression = progression;
  }
}
