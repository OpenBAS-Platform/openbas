package io.openbas.utils;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;

import java.util.List;
import java.util.Map;

public class OperationUtilsJpa {

  private OperationUtilsJpa() {

  }

  // -- NOT CONTAINS --

  public static Predicate notContainsTexts(
      Expression<String> paths, CriteriaBuilder cb,
      List<String> texts, Class<?> type) {
    Predicate[] predicates = texts.stream()
        .map(text -> notContainsText(paths, cb, text, type))
        .toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  public static Predicate notContainsText(
      Expression<String> paths, CriteriaBuilder cb,
      String text, Class<?> type) {
    return containsText(paths, cb, text, type).not();
  }

  // -- CONTAINS --

  public static Predicate containsTexts(
      Expression<String> paths, CriteriaBuilder cb,
      List<String> texts,
      Class<?> type) {
    Predicate[] predicates = texts.stream().map(text -> containsText(paths, cb, text, type)).toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  public static Predicate containsText(Expression<String> paths, CriteriaBuilder cb, String text, Class<?> type) {
    if (type.isAssignableFrom(Map.class) || type.getName().contains("ImmutableCollections")) {
      Expression<String> values = lower(arrayToString(avals(paths, cb), cb), cb);
      return cb.like(values, "%" + text.toLowerCase() + "%");
    }
    if (type.isArray()) {
      return cb.like(
          lower(arrayToString(paths, cb), cb),
          "%" + text.toLowerCase() + "%"
      );
    }
    return cb.and(
        cb.like(cb.lower(paths), "%" + text.toLowerCase() + "%"),
        cb.isNotNull(paths)
    );
  }

  // -- NOT EQUALS --

  public static Predicate notEqualsTexts(Expression<String> paths, CriteriaBuilder cb, List<String> texts, Class<?> type) {
    Predicate[] predicates = texts.stream().map(text -> notEqualsText(
        paths, cb, text, type
    )).toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  private static Predicate notEqualsText(Expression<String> paths, CriteriaBuilder cb, String text, Class<?> type) {
    return equalsText(paths, cb, text, type).not();
  }

  // -- EQUALS --

  public static Predicate equalsTexts(Expression<String> paths, CriteriaBuilder cb, List<String> texts, Class<?> type) {
    Predicate[] predicates = texts.stream().map(text -> equalsText(
        paths, cb, text, type
    )).toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  private static Predicate equalsText(Expression<String> paths, CriteriaBuilder cb, String text, Class<?> type) {
    if (type.isAssignableFrom(Map.class) || type.getName().contains("ImmutableCollections")) {
      Expression<String[]> values = lowerArray(avals(paths, cb), cb);
      return cb.isNotNull(arrayPosition(values, cb, cb.literal(text.toLowerCase())));
    }
    if (text.equalsIgnoreCase("true") || text.equalsIgnoreCase("false")) {
      return cb.equal(paths, Boolean.valueOf(text));
    } else {
      return cb.equal(cb.lower(paths), text.toLowerCase());
    }
  }

  // -- NOT START WITH --

  public static Predicate notStartWithTexts(Expression<String> paths, CriteriaBuilder cb, List<String> texts) {
    Predicate[] predicates = texts.stream().map(text -> notStartWithText(paths, cb, text)).toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  public static Predicate notStartWithText(Expression<String> paths, CriteriaBuilder cb, String text) {
    return startWithText(paths, cb, text).not();
  }

  // -- START WITH --

  public static Predicate startWithTexts(Expression<String> paths, CriteriaBuilder cb, List<String> texts) {
    Predicate[] predicates = texts.stream().map(text -> startWithText(paths, cb, text)).toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  public static Predicate startWithText(Expression<String> paths, CriteriaBuilder cb, String text) {
    return cb.like(cb.lower(paths), text.toLowerCase() + "%");
  }

  // -- NOT EMPTY --

  public static Predicate notEmpty(Expression<String> paths, CriteriaBuilder cb, Class<?> type) {
    return empty(paths, cb, type).not();
  }

  // -- EMPTY --

  public static Predicate empty(Expression<String> paths, CriteriaBuilder cb, Class<?> type) {
    Expression<String> finalPaths;
    if (type.isArray()) {
      finalPaths = arrayToString(paths, cb);
    } else {
      finalPaths = paths;
    }
    return cb.or(
        cb.isNull(finalPaths),
        cb.equal(finalPaths, ""),
        cb.equal(finalPaths, " ")
    );
  }

  // -- CUSTOM FUNCTION --

  private static Expression<String[]> lowerArray(Expression<?> paths, CriteriaBuilder cb)  {
    return stringToArray(lower(arrayToString(paths, cb), cb), cb);
  }

  // -- BASE FUNCTION --

  private static Expression<Boolean> arrayPosition(Expression<String[]> paths, CriteriaBuilder cb, Expression<String> text)  {
    return cb.function("array_position", Boolean.class, paths, text);
  }

  private static Expression<String> lower(Expression<String> paths, CriteriaBuilder cb)  {
    return cb.function("lower", String.class, paths);
  }

  private static Expression<String[]> stringToArray(Expression<String> paths, CriteriaBuilder cb)  {
    return cb.function("string_to_array", String[].class, paths, cb.literal(" && "));
  }

  private static Expression<String> arrayToString(Expression<?> paths, CriteriaBuilder cb)  {
    return cb.function("array_to_string", String.class, paths, cb.literal(" && "));
  }

  private static Expression<String[]> avals(Expression<String> paths, CriteriaBuilder cb)  {
    return cb.function("avals", String[].class, paths);
  }

}
