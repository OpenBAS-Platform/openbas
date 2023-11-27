package io.openex.database.specification;

import io.openex.database.model.DataMapper;
import io.openex.database.model.DataMapper.TYPE;
import org.springframework.data.jpa.domain.Specification;

import javax.validation.constraints.NotNull;

public class DataMapperSpecification {

  public static Specification<DataMapper> fromType(@NotNull final TYPE type) {
    return (root, query, cb) -> cb.equal(root.get("type"), type);
  }
}
