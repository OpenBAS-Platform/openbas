package io.openbas.engine.model.inject;

import io.openbas.annotation.Indexable;
import io.openbas.annotation.Queryable;
import io.openbas.engine.model.EsBase;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Indexable(index = "inject", label = "Inject")
public class EsInject extends EsBase {
  /* Every attribute must be uniq, so prefixed with the entity type! */

  @Queryable(label = "title", filterable = true, sortable = true)
  private String inject_title;

  @Queryable(label = "status", filterable = true, sortable = true)
  private String inject_status;
}
