package io.openbas.engine.model.simulation;

import io.openbas.annotation.Indexable;
import io.openbas.annotation.Queryable;
import io.openbas.engine.model.EsBase;

@Indexable(index = "simulation", label = "Simulation")
public class EsSimulation extends EsBase {

  @Queryable(label = "simulation name")
  private String name;
}
