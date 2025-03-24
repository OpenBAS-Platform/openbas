package io.openbas.engine.model.inject;

import io.openbas.annotation.Indexable;
import io.openbas.annotation.Queryable;
import io.openbas.engine.model.EsBase;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Indexable(index = "inject", label = "Inject")
public class EsInject extends EsBase {
  /* Every attribute must be uniq, so prefixed with the entity type! */

  @Queryable(label = "title", filterable = true, sortable = true)
  private String inject_title;

  @Queryable(label = "scenario", filterable = true, sortable = true)
  private String inject_scenario_side;

  @Queryable(label = "simulation", filterable = true, sortable = true)
  private String inject_simulation_side;

  @Queryable(label = "status", filterable = true, sortable = true)
  private String inject_status;

  @Queryable(label = "contract", filterable = true, sortable = true)
  private String contract_side;

  @Queryable(label = "attack patterns", filterable = true, sortable = true)
  private Set<String> attack_patterns_side;

  @Queryable(label = "kill chain phases", filterable = true, sortable = true)
  private Set<String> kill_chain_phases_side;
}
