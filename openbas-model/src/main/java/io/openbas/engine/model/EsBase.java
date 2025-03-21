package io.openbas.engine.model;

import io.openbas.annotation.Queryable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsBase {

  @Queryable(filterable = true, sortable = true)
  private String id;

  @Queryable(filterable = true, sortable = true)
  private String type;

  @Queryable(filterable = true, sortable = true)
  private Instant created_at;

  @Queryable(filterable = true, sortable = true)
  private Instant updated_at;

  // To support logical side deletions
  // https://github.com/rieske/postgres-cdc
  private List<String> dependencies = new ArrayList<>();
}
