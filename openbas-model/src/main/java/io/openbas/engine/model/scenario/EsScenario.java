package io.openbas.engine.model.scenario;

import io.openbas.annotation.Indexable;
import io.openbas.engine.model.EsBase;

@Indexable(index = "scenario", label = "Scenario")
public class EsScenario extends EsBase {
  /* Every attribute must be uniq, so prefixed with the entity type! */
}
