package io.openbas.engine.model.scenario;

import io.openbas.annotation.EsQueryable;
import io.openbas.annotation.Indexable;
import io.openbas.annotation.Queryable;
import io.openbas.engine.model.EsBase;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Indexable(index = "scenario", label = "Scenario")
public class EsScenario extends EsBase {
  /* Every attribute must be uniq, so prefixed with the entity type! */
  /* Except relationships, they should have same name on every model! */

  @Queryable(label = "scenario name")
  private String name;

  // -- SIDE --

  @Queryable(label = "tags", filterable = true, dynamicValues = true)
  @EsQueryable(keyword = true)
  private Set<String> base_tags_side; // Must finish by _side

  @Queryable(label = "endpoint", filterable = true, dynamicValues = true)
  @EsQueryable(keyword = true)
  private Set<String> base_endpoint_side; // Must finish by _side

  @Queryable(label = "asset group", filterable = true, dynamicValues = true)
  @EsQueryable(keyword = true)
  private Set<String> base_asset_group_side; // Must finish by _side

  @Queryable(label = "team", filterable = true, dynamicValues = true)
  @EsQueryable(keyword = true)
  private Set<String> base_team_side; // Must finish by _side
}
