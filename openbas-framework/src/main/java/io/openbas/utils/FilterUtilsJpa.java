package io.openbas.utils;

import io.openbas.database.model.Filters.Filter;
import io.openbas.database.model.Filters.FilterGroup;
import io.openbas.database.model.Filters.FilterMode;
import io.openbas.database.model.Filters.FilterOperator;
import io.openbas.utils.schema.PropertySchema;
import io.openbas.utils.schema.SchemaUtils;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.validation.constraints.NotNull;
import org.jetbrains.annotations.Nullable;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Function;

import static io.openbas.database.model.Filters.FilterMode.and;
import static io.openbas.database.model.Filters.FilterMode.or;
import static io.openbas.utils.JpaUtils.toPath;
import static io.openbas.utils.OperationUtilsJpa.*;
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
  private static <T, U> Specification<T> computeFilter(@Nullable final Filter filter) {
    if (filter == null) {
      return (Specification<T>) EMPTY_SPECIFICATION;
    }
    String filterKey = filter.getKey();

    return (root, query, cb) -> {
      List<PropertySchema> propertySchemas = SchemaUtils.schema(root.getJavaType());
      List<PropertySchema> filterableProperties = getFilterableProperties(propertySchemas);
      PropertySchema filterableProperty = retrieveProperty(filterableProperties, filterKey);
      Expression<U> paths = toPath(filterableProperty, root);
      // In case of join table, we will use ID so type is String
      return toPredicate(
          paths, filter, cb, filterableProperty.getJoinTable() != null ? String.class : filterableProperty.getType()
      );
    };
  }

  private static <U> Predicate toPredicate(
      @NotNull final Expression<U> paths,
      @NotNull final Filter filter,
      @NotNull final CriteriaBuilder cb,
      @NotNull final Class<?> type) {
    BiFunction<Expression<U>, List<String>, Predicate> operation = computeOperation(
        filter.getOperator(), cb, type
    );
    return operation.apply(paths, filter.getValues());
  }

  // -- OPERATOR --

  private static <U> BiFunction<Expression<U>, List<String>, Predicate> computeOperation(
      @Nullable final FilterOperator operator,
      @NotNull final CriteriaBuilder cb,
      @NotNull final Class<?> type) {
    if (operator == null) {
      throw new IllegalArgumentException("Operator cannot be null");
    }
    if (operator.equals(FilterOperator.not_contains)) {
      return (Expression<U> paths, List<String> texts) -> notContainsTexts((Expression<String>) paths, cb, texts, type);
    } else if (operator.equals(FilterOperator.contains)) {
      return (Expression<U> paths, List<String> texts) -> containsTexts((Expression<String>) paths, cb, texts, type);
    } else if (operator.equals(FilterOperator.not_starts_with)) {
      return (Expression<U> paths, List<String> texts) -> notStartWithTexts((Expression<String>) paths, cb, texts, type);
    } else if (operator.equals(FilterOperator.starts_with)) {
      return (Expression<U> paths, List<String> texts) -> startWithTexts((Expression<String>) paths, cb, texts, type);
    } else if (operator.equals(FilterOperator.empty)) {
      return (Expression<U> paths, List<String> texts) -> empty((Expression<String>) paths, cb, type);
    } else if (operator.equals(FilterOperator.not_empty)) {
      return (Expression<U> paths, List<String> texts) -> notEmpty((Expression<String>) paths, cb, type);
    } else if (operator.equals(FilterOperator.gt)) {
      return (Expression<U> paths, List<String> texts) -> greaterThanTexts((Expression<Instant>) paths, cb, texts);
    } else if (operator.equals(FilterOperator.gte)) {
      return (Expression<U> paths, List<String> texts) -> greaterThanOrEqualTexts((Expression<Instant>) paths, cb, texts);
    } else if (operator.equals(FilterOperator.lt)) {
      return (Expression<U> paths, List<String> texts) -> lessThanTexts((Expression<Instant>) paths, cb, texts);
    } else if (operator.equals(FilterOperator.lte)) {
      return (Expression<U> paths, List<String> texts) -> lessThanOrEqualTexts((Expression<Instant>) paths, cb, texts);
    } else if (operator.equals(FilterOperator.not_eq)) {
      return (Expression<U> paths, List<String> texts) -> notEqualsTexts((Expression<String>) paths, cb, texts, type);
    } else { // Default case -> equals
      return (Expression<U> paths, List<String> texts) -> equalsTexts((Expression<String>) paths, cb, texts, type);
    }
  }

}
