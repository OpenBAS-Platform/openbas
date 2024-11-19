package io.openbas.model;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExecutionProcess {

  private boolean async;

  public ExecutionProcess(boolean async) {
    this.async = async;
  }
}
