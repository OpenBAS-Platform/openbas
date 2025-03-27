package io.openbas.engine.api;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class HistogramConfig {
  private final String mode;

  public HistogramConfig(String mode) {
    this.mode = mode;
  }
}
