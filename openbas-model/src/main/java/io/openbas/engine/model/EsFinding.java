package io.openbas.engine.model;

import io.openbas.annotation.Queryable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsFinding extends EsBase {

  public static final String FINDING_TYPE = "finding";

  @Queryable(filterable = true, sortable = true)
  private String value;

  @Queryable(filterable = true, sortable = true)
  private String field;

  @Queryable(filterable = true, sortable = true)
  private String inject;

  @Queryable(filterable = true, sortable = true)
  private String simulation;

  @Queryable(filterable = true, sortable = true)
  private String scenario;
}
