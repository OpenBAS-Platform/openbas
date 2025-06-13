package io.openbas.engine.model.tag;

import io.openbas.annotation.EsQueryable;
import io.openbas.annotation.Indexable;
import io.openbas.annotation.Queryable;
import io.openbas.engine.model.EsBase;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@Indexable(index = "tag", label = "Tag")
public class EsTag extends EsBase {
  /* Every attribute must be uniq, so prefixed with the entity type! */
  /* Except relationships, they should have same name on every model! */

  @Queryable(label = "tag color", filterable = true)
  @EsQueryable(keyword = true)
  private String tag_color;
}
