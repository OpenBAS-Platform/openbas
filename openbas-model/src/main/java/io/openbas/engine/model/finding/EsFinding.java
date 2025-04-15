package io.openbas.engine.model.finding;

import io.openbas.annotation.EsQueryable;
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
  /* Except relationships, they should have same name on every model! */

  @Queryable(label = "value", filterable = true, sortable = true)
  private String finding_value;

  @Queryable(label = "finding type", filterable = true, sortable = true)
  private String finding_type;

  @Queryable(label = "field", filterable = true, sortable = true)
  private String finding_field;

  // -- SIDE --

  @Queryable(label = "inject", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_inject_side; // Must finish by _side

  @Queryable(label = "scenario", filterable = true, sortable = true)
  @EsQueryable(keyword = true)
  private String base_scenario_side; // Must finish by _side
}
