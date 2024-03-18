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
import org.springframework.data.jpa.domain.Specification;

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
    List<String> filterValues = filter.getValues();

    if (!filterValues.isEmpty()) {
      return (root, query, cb) -> {
        List<PropertySchema> propertySchemas = SchemaUtils.schema(root.getJavaType());
        List<PropertySchema> filterableProperties = getFilterableProperties(propertySchemas);
        PropertySchema filterableProperty = retrieveProperty(filterableProperties, filterKey);
        Expression<String> paths = toPath(filterableProperty, root);
        return toPredicate(paths, filter, cb, filterableProperty.getType());
      };
    }
    return (Specification<T>) EMPTY_SPECIFICATION;
  }

  private static Predicate toPredicate(
      @NotNull final Expression<String> paths,
      @NotNull final Filter filter,
      @NotNull final CriteriaBuilder cb,
      @NotNull final Class<?> type) {
    BiFunction<Expression<String>, List<String>, Predicate> operation = computeOperation(filter.getOperator(), cb, type);
    return operation.apply(paths, filter.getValues());
  }

  // -- OPERATOR --

  private static BiFunction<Expression<String>, List<String>, Predicate> computeOperation(
      @NotNull final FilterOperator operator,
      @NotNull final CriteriaBuilder cb,
      @NotNull final Class<?> type) {
    if (operator == null) {
      // Default case
      return (Expression<String> paths, List<String> texts) -> OperationUtilsJpa.equalsTexts(paths, cb, texts);
    }
    if (operator.equals(FilterOperator.not_contains)) {
      return (Expression<String> paths, List<String> texts) -> OperationUtilsJpa.notContainsTexts(paths, cb, texts, type);
    } else if (operator.equals(FilterOperator.contains)) {
      return (Expression<String> paths, List<String> texts) -> OperationUtilsJpa.containsTexts(paths, cb, texts, type);
    } else if (operator.equals(FilterOperator.not_starts_with)) {
      return (Expression<String> paths, List<String> texts) -> OperationUtilsJpa.notStartWithTexts(paths, cb, texts);
    } else if (operator.equals(FilterOperator.starts_with)) {
      return (Expression<String> paths, List<String> texts) -> OperationUtilsJpa.startWithTexts(paths, cb, texts);
    } else if (operator.equals(FilterOperator.not_eq)) {
      return (Expression<String> paths, List<String> texts) -> OperationUtilsJpa.notEqualsTexts(paths, cb, texts);
    } else { // Default case
      return (Expression<String> paths, List<String> texts) -> OperationUtilsJpa.equalsTexts(paths, cb, texts);
    }
  }

}
