package io.openbas.engine.model.injectexpectation;

import io.openbas.annotation.EsQueryable;
import io.openbas.annotation.Indexable;
import io.openbas.annotation.Queryable;
import io.openbas.engine.model.EsBase;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Indexable(index = "expectation-inject", label = "Inject expectation")
public class EsInjectExpectation extends EsBase {
  /* Every attribute must be uniq, so prefixed with the entity type! */
  /* Except relationships, they should have same name on every model! */

  @Queryable(label = "expectation inject type", filterable = true)
  @EsQueryable(keyword = true)
  private String inject_expectation_type;

  @Queryable(label = "name", filterable = true, sortable = true)
  private String inject_expectation_name;

  @Queryable(label = "description", filterable = true, sortable = true)
  private String inject_expectation_description;

  @Queryable(label = "results")
  private String inject_expectation_results;

  @Queryable(label = "score", filterable = true, sortable = true)
  private Double inject_expectation_score;

  @Queryable(label = "expected score", filterable = true, sortable = true)
  private Double inject_expectation_expected_score;

  @Queryable(label = "expiration time", filterable = true)
  private Long inject_expectation_expiration_time;

  @Queryable(label = "group", filterable = true)
  private Boolean inject_expectation_group;

  @Queryable(label = "status", filterable = true)
  @EsQueryable(keyword = true)
  private String inject_expectation_status;

  // -- SIDE --

  @Queryable(label = "simulation", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_simulation_side; // Must finish by _side

  @Queryable(label = "inject", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_inject_side; // Must finish by _side

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
}
