package io.openbas.utils;

import io.openbas.database.model.Filters.Filter;
import io.openbas.database.model.Filters.FilterGroup;
import io.openbas.database.model.Filters.FilterMode;
import io.openbas.database.model.Filters.FilterOperator;
import io.openbas.utils.schema.PropertySchema;
import io.openbas.utils.schema.SchemaUtils;
import jakarta.persistence.criteria.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.CollectionUtils;

import javax.annotation.Nullable;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Function;

import static io.openbas.database.model.Filters.FilterMode.and;
import static io.openbas.database.model.Filters.FilterMode.or;
import static io.openbas.utils.JpaUtils.toPath;
import static io.openbas.utils.schema.SchemaUtils.getFilterableProperties;
import static io.openbas.utils.schema.SchemaUtils.retrieveProperty;

public class FilterUtilsJpa {

  private FilterUtilsJpa() {

  }

  public record Option(String id, String label) {

  }

  private static final Specification<?> EMPTY_SPECIFICATION = (root, query, cb) -> cb.conjunction();

  @SuppressWarnings("unchecked")
  public static <T> Specification<T> computeFilterGroupJpa(@Nullable final FilterGroup filterGroup) {
    if (filterGroup == null) {
      return (Specification<T>) EMPTY_SPECIFICATION;
    }
    List<Filter> filters = Optional.ofNullable(filterGroup.getFilters()).orElse(new ArrayList<>());
    FilterMode mode = Optional.ofNullable(filterGroup.getMode()).orElse(and);

    if (!filters.isEmpty()) {
      List<Specification<T>> list = filters
          .stream()
          .map((Function<? super Filter, Specification<T>>) FilterUtilsJpa::computeFilter)
          .toList();
      Specification<T> result = null;
      for (Specification<T> el : list) {
        if (result == null) {
          result = el;
        } else {
          if (or.equals(mode)) {
            result = result.or(el);
          } else {
            // Default case
            result = result.and(el);
          }
        }
      }
      return result;
    }
    return (Specification<T>) EMPTY_SPECIFICATION;
  }

  @SuppressWarnings("unchecked")
  private static <T> Specification<T> computeFilter(@Nullable final Filter filter) {
    if (filter == null) {
      return (Specification<T>) EMPTY_SPECIFICATION;
    }
    String filterKey = filter.getKey();

    return (root, query, cb) -> {
      List<PropertySchema> propertySchemas = SchemaUtils.schema(root.getJavaType());
      List<PropertySchema> filterableProperties = getFilterableProperties(propertySchemas);
      PropertySchema filterableProperty = retrieveProperty(filterableProperties, filterKey);
      Expression<String> paths = toPath(filterableProperty, root);
      // In case of join table, we will use ID so type is String
      return toPredicate(
          paths, filter, cb, filterableProperty.getJoinTable() != null ? String.class : filterableProperty.getType()
      );
    };
  }

  /**
   * Allows to manage deep paths not currently managed by the queryable annotation Next step: improvement of the
   * queryable annotation in order to directly manage filters on deep properties as well as having several possible
   * filters on these properties
   */
  @SuppressWarnings("unchecked")
  public static <T> Specification<T> computeFilterFromSpecificPath(
      @Nullable final Filter filter,
      @NotBlank final String jsonPath) {
    if (filter == null) {
      return (Specification<T>) EMPTY_SPECIFICATION;
    }

    String[] jsonPaths = jsonPath.split("\\.");
    return (root, query, cb) -> {
      if (jsonPaths.length > 0) {
        Join<Object, Object> paths = root.join(jsonPaths[0], JoinType.LEFT);
        for (int i = 1; i < jsonPaths.length - 1; i++) {
          paths = paths.join(jsonPaths[i], JoinType.LEFT);
        }
        Path<String> finalPath = paths.get(jsonPaths[jsonPaths.length - 1]);
        return toPredicate(finalPath, filter, cb, String.class);
      }
      throw new IllegalArgumentException();
    };
  }

  private static Predicate toPredicate(
      @NotNull final Expression<String> paths,
      @NotNull final Filter filter,
      @NotNull final CriteriaBuilder cb,
      @NotNull final Class<?> type) {
    BiFunction<Expression<String>, List<String>, Predicate> operation = computeOperation(
        filter.getOperator(), cb, type
    );
    return operation.apply(paths, filter.getValues());
  }

  // -- OPERATOR --

  private static BiFunction<Expression<String>, List<String>, Predicate> computeOperation(
      @NotNull final FilterOperator operator,
      @NotNull final CriteriaBuilder cb,
      @NotNull final Class<?> type) {
    if (operator == null) {
      // Default case
      return (Expression<String> paths, List<String> texts) -> OperationUtilsJpa.equalsTexts(paths, cb, texts, type);
    }
    if (operator.equals(FilterOperator.not_contains)) {
      return (Expression<String> paths, List<String> texts) -> {
        if (CollectionUtils.isEmpty(texts)) {
          return null;
        }
        return OperationUtilsJpa.notContainsTexts(paths, cb, texts, type);
      };
    } else if (operator.equals(FilterOperator.contains)) {
      return (Expression<String> paths, List<String> texts) -> {
        if (CollectionUtils.isEmpty(texts)) {
          return null;
        }
        return OperationUtilsJpa.containsTexts(paths, cb, texts, type);
      };
    } else if (operator.equals(FilterOperator.not_starts_with)) {
      return (Expression<String> paths, List<String> texts) -> OperationUtilsJpa.notStartWithTexts(paths, cb, texts);
    } else if (operator.equals(FilterOperator.starts_with)) {
      return (Expression<String> paths, List<String> texts) -> OperationUtilsJpa.startWithTexts(paths, cb, texts);
    } else if (operator.equals(FilterOperator.not_eq)) {
      return (Expression<String> paths, List<String> texts) -> OperationUtilsJpa.notEqualsTexts(paths, cb, texts, type);
    } else if (operator.equals(FilterOperator.empty)) {
      return (Expression<String> paths, List<String> texts) -> OperationUtilsJpa.empty(paths, cb, type);
    } else if (operator.equals(FilterOperator.not_empty)) {
      return (Expression<String> paths, List<String> texts) -> OperationUtilsJpa.notEmpty(paths, cb, type);
    } else { // Default case -> equals
      return (Expression<String> paths, List<String> texts) -> OperationUtilsJpa.equalsTexts(paths, cb, texts, type);
    }
  }

}
