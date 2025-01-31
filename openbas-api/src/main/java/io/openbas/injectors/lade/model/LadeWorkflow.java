package io.openbas.injectors.lade.model;

import io.openbas.database.model.ExecutionTraces;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
public class LadeWorkflow {

  private final List<ExecutionTraces> traces = new ArrayList<>();

  @Setter private boolean done = false;

  @Setter private boolean fail = false;

  @Setter private Instant stopTime;

  public void addTrace(ExecutionTraces trace) {
    this.traces.add(trace);
  }
}
