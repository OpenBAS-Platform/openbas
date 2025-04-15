package io.openbas.engine.model.inject;

import io.openbas.annotation.EsQueryable;
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
  /* Except relationships, they should have same name on every model! */

  @Queryable(label = "title", filterable = true, sortable = true)
  private String inject_title;

  @Queryable(label = "status", filterable = true, sortable = true)
  private String inject_status;

  // -- SIDE --

  @Queryable(label = "scenario", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_scenario_side; // Must finish by _side

  @Queryable(label = "simulation", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_simulation_side; // Must finish by _side

  @Queryable(label = "attack patterns", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private Set<String> base_attack_patterns_side; // Must finish by _side

  @Queryable(label = "kill chain phases", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private Set<String> base_kill_chain_phases_side; // Must finish by _side

  @Queryable(label = "inject contract", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_inject_contract_side; // Must finish by _side
}
