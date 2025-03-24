package io.openbas.engine.model.finding;

import io.openbas.annotation.Indexable;
import io.openbas.annotation.Queryable;
import io.openbas.engine.model.EsBase;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Indexable(index = "finding", label = "Finding")
public class EsFinding extends EsBase {
  /* Every attribute must be uniq, so prefixed with the entity type! */

  @Queryable(label = "value", filterable = true, sortable = true)
  private String finding_value;

  @Queryable(label = "type", filterable = true, sortable = true)
  private String finding_type;

  @Queryable(label = "field", filterable = true, sortable = true)
  private String finding_field;

  @Queryable(label = "inject", filterable = true, sortable = true)
  private String finding_inject_side; // Must finish by _side

  @Queryable(label = "simulation", filterable = true, sortable = true)
  private String finding_simulation_side; // Must finish by _side

  @Queryable(label = "scenario", filterable = true, sortable = true)
  private String finding_scenario_side; // Must finish by _side
}
