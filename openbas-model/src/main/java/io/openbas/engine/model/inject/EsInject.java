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

  @Queryable(label = "inject title")
  private String inject_title;

  @Queryable(label = "inject status")
  private String inject_status;

  // -- SIDE --

  @Queryable(label = "scenario")
  @EsQueryable(keyword = true)
  private String base_scenario_side; // Must finish by _side

  @Queryable(label = "simulation", filterable = true)
  @EsQueryable(keyword = true)
  private String base_simulation_side; // Must finish by _side

  @Queryable(label = "attack patterns")
  @EsQueryable(keyword = true)
  private Set<String> base_attack_patterns_side; // Must finish by _side

  @Queryable(label = "inject children")
  @EsQueryable(keyword = true)
  private Set<String> base_inject_children_side; // Must finish by _side

  @Queryable(label = "attack patterns children")
  @EsQueryable(keyword = true)
  private Set<String> base_attack_patterns_children_side; // Must finish by _side

  @Queryable(label = "kill chain phases")
  @EsQueryable(keyword = true)
  private Set<String> base_kill_chain_phases_side; // Must finish by _side

  @Queryable(label = "inject contract")
  @EsQueryable(keyword = true)
  private String base_inject_contract_side; // Must finish by _side
}
