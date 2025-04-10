package io.openbas.engine.model.injectexpectation;

import io.openbas.annotation.EsQueryable;
import io.openbas.annotation.Indexable;
import io.openbas.annotation.Queryable;
import io.openbas.engine.model.EsBase;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Indexable(index = "expectation-inject", label = "Inject expectation")
public class EsInjectExpectation extends EsBase {
  /* Every attribute must be uniq, so prefixed with the entity type! */

  @Queryable(label = "type", filterable = true)
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
}
