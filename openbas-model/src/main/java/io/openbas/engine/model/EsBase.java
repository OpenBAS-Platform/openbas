package io.openbas.engine.model;

import io.openbas.annotation.EsQueryable;
import io.openbas.annotation.Indexable;
import io.openbas.annotation.Queryable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsBase {

  @Queryable(label = "id", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_id;

  @Queryable(label = "entity", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_entity;

  private String base_representative;

  @Queryable(label = "created at", filterable = true, sortable = true)
  private Instant base_created_at;

  @Queryable(label = "updated at", filterable = true, sortable = true)
  private Instant base_updated_at;

  // -- SIDE --

  @Queryable(label = "inject", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_inject_side; // Must finish by _side

  @Queryable(label = "inject contract", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_inject_contract_side; // Must finish by _side

  @Queryable(label = "simulation", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_simulation_side; // Must finish by _side

  @Queryable(label = "scenario", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_scenario_side; // Must finish by _side

  @Queryable(label = "user", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_user_side; // Must finish by _side

  @Queryable(label = "team", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_team_side; // Must finish by _side

  @Queryable(label = "agent", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_agent_side; // Must finish by _side

  @Queryable(label = "asset", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_asset_side; // Must finish by _side

  @Queryable(label = "asset group", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_asset_group_side; // Must finish by _side

  @Queryable(label = "attack patterns", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private Set<String> base_attack_patterns_side; // Must finish by _side

  @Queryable(label = "kill chain phases", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private Set<String> base_kill_chain_phases_side; // Must finish by _side

  // -- Base for ACL --
  private List<String> base_restrictions;

  // To support logical side deletions
  // https://github.com/rieske/postgres-cdc could be an alternative.
  private List<String> base_dependencies = new ArrayList<>();

  public EsBase() {
    try {
      base_entity = this.getClass().getAnnotation(Indexable.class).index();
    } catch (Exception e) {
      // Need for json deserialize
    }
  }
}
