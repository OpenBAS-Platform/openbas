package io.openbas.engine.model.injectexpectation;

import io.openbas.annotation.Indexable;
import io.openbas.annotation.Queryable;
import io.openbas.engine.model.EsBase;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Indexable(index = "expectation-inject", label = "Inject expectation") // Caused by:
// co.elastic.clients.elasticsearch._types.ElasticsearchException:
// [es/indices.put_index_template] failed:
// [illegal_argument_exception] index template
// [openbas_inject-expectation] has index patterns
// [openbas_inject-expectation*] matching patterns from existing
// templates [openbas_inject] with patterns (openbas_inject =>
// [openbas_inject*]) that have the same priority [0], multiple index
// templates may not match during index creation, please use a
// different priority
public class EsInjectExpectation extends EsBase {

  @Queryable(label = "type", filterable = true)
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
}
