package io.openbas.engine.model;

import io.openbas.annotation.Indexable;
import io.openbas.annotation.Queryable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsBase {

  @Queryable(label = "id", filterable = true, sortable = true)
  private String base_id;

  @Queryable(label = "entity", filterable = true, sortable = true)
  private final String base_entity;

  private String base_representative;

  @Queryable(label = "created at", filterable = true, sortable = true)
  private Instant base_created_at;

  @Queryable(label = "updated at", filterable = true, sortable = true)
  private Instant base_updated_at;

  // To support logical side deletions
  // https://github.com/rieske/postgres-cdc could be an alternative.
  private List<String> base_dependencies = new ArrayList<>();

  public EsBase() {
    base_entity = this.getClass().getAnnotation(Indexable.class).index();
  }
}
