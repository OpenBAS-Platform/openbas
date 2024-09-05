package io.openbas.utils;

import io.openbas.utils.schema.PropertySchema;
import jakarta.persistence.criteria.*;
import jakarta.validation.constraints.NotNull;

import static org.springframework.util.StringUtils.hasText;

public class JpaUtils {

  private JpaUtils() {

  }

  public static <T, U> Expression<U> toPath(
      @NotNull final PropertySchema propertySchema,
      @NotNull final Root<T> root) {
    // Path
    if (hasText(propertySchema.getPath())) {
      String[] jsonPaths = propertySchema.getPath().split("\\.");
      if (jsonPaths.length > 0) {
        Join<Object, Object> paths = root.join(jsonPaths[0], JoinType.LEFT);
        for (int i = 1; i < jsonPaths.length - 1; i++) {
          paths = paths.join(jsonPaths[i], JoinType.LEFT);
        }
        return paths.get(jsonPaths[jsonPaths.length - 1]);
      }
    }
    // Join
    if (propertySchema.getJoinTable() != null) {
      PropertySchema.JoinTable joinTable = propertySchema.getJoinTable();
      return root.join(joinTable.getJoinOn(), JoinType.LEFT).get("id");
    } else {
      return root.get(propertySchema.getName());
    }
  }

  // -- FUNCTION --

  public static <T, U> Expression<String[]> arrayAggOnId(
      @NotNull final CriteriaBuilder cb,
      @NotNull final Join<T, U> join) {
    return cb.function(
        "array_remove",
        String[].class,
        cb.function("array_agg", String[].class, join.get("id")),
        cb.nullLiteral(String.class)
    );
  }

  // -- JOIN --

  public static <X, Y> Join<X, Y> createLeftJoin(Root<X> root, String attributeName) {
    return root.join(attributeName, JoinType.LEFT);
  }

  public static <X, Y> Expression<String[]> createJoinArrayAggOnId(CriteriaBuilder cb, Root<X> root, String attributeName) {
    Join<X, Y> join = createLeftJoin(root, attributeName);
    return arrayAggOnId(cb, join);
  }

}
