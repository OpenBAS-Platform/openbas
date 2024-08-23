package io.openbas.utils;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.springframework.util.StringUtils.hasText;

public class OperationUtilsJpa {

  private OperationUtilsJpa() {

  }

  // -- NOT CONTAINS --

  public static Predicate notContainsTexts(
      Expression<Object> paths, CriteriaBuilder cb,
      List<String> texts, Class<?> type) {
    Predicate[] predicates = texts.stream()
        .map(text -> notContainsText(paths, cb, text, type))
        .toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  public static Predicate notContainsText(
      Expression<Object> paths, CriteriaBuilder cb,
      String text, Class<?> type) {
    return containsText(paths, cb, text, type).not();
  }

  // -- CONTAINS --

  public static Predicate containsTexts(
      Expression<Object> paths, CriteriaBuilder cb,
      List<String> texts,
      Class<?> type) {
    if (texts == null || texts.isEmpty()) {
      return cb.conjunction();
    }

    Predicate[] predicates = texts.stream().map(text -> containsText(paths, cb, text, type)).toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  public static Predicate containsText(Expression<Object> paths, CriteriaBuilder cb, String text, Class<?> type) {
    if (text == null) {
      return cb.conjunction();
    }

    if (type.isAssignableFrom(Map.class) || type.getName().contains("ImmutableCollections")) {
      Expression<Object> values = lower(arrayToString(avals(paths, cb), cb), cb);
      return cb.like(values.as(String.class), "%" + text.toLowerCase() + "%");
    }
    if (type.isArray()) {
      return cb.like(
          lower(arrayToString(paths, cb), cb).as(String.class),
          "%" + text.toLowerCase() + "%"
      );
    }
    return cb.and(
        cb.like(cb.lower(paths.as(String.class)), "%" + text.toLowerCase() + "%"),
        cb.isNotNull(paths)
    );
  }

  // -- NOT EQUALS --

  public static Predicate notEqualsTexts(Expression<Object> paths, CriteriaBuilder cb, List<String> texts, Class<?> type) {
    if (texts == null || texts.isEmpty() || texts.stream().anyMatch(s -> !hasText(s))) {
      return cb.conjunction();
    }

    Predicate[] predicates = texts.stream().map(text -> notEqualsText(
        paths, cb, text, type
    )).toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  private static Predicate notEqualsText(Expression<Object> paths, CriteriaBuilder cb, String text, Class<?> type) {
    return equalsText(paths, cb, text, type).not();
  }

  // -- EQUALS --

  public static Predicate equalsTexts(Expression<Object> paths, CriteriaBuilder cb, List<String> texts, Class<?> type) {
    if (texts == null || texts.isEmpty() || texts.stream().anyMatch(s -> !hasText(s))) {
      return cb.conjunction();
    }

    Predicate[] predicates = texts.stream().map(text -> equalsText(
        paths, cb, text, type
    )).toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  private static Predicate equalsText(Expression<Object> paths, CriteriaBuilder cb, String text, Class<?> type) {
    if (text == null) {
      return cb.conjunction();
    }

    if (type.isAssignableFrom(Map.class) || type.getName().contains("ImmutableCollections")) {
      Expression<String[]> values = lowerArray(avals(paths, cb), cb);
      return cb.isNotNull(arrayPosition(values, cb, cb.literal(text.toLowerCase())));
    }
    if (text.equalsIgnoreCase("true") || text.equalsIgnoreCase("false")) {
      return cb.equal(paths, Boolean.valueOf(text));
    } else {
      return cb.equal(cb.lower(paths.as(String.class)), text.toLowerCase());
    }
  }

  // -- NOT START WITH --

  public static Predicate notStartWithTexts(Expression<Object> paths, CriteriaBuilder cb, List<String> texts) {
    if (texts == null || texts.isEmpty() || texts.stream().anyMatch(s -> !hasText(s))) {
      return cb.conjunction();
    }

    Predicate[] predicates = texts.stream().map(text -> notStartWithText(paths, cb, text)).toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  public static Predicate notStartWithText(Expression<Object> paths, CriteriaBuilder cb, String text) {
    return startWithText(paths, cb, text).not();
  }

  // -- START WITH --

  public static Predicate startWithTexts(Expression<Object> paths, CriteriaBuilder cb, List<String> texts) {
    if (texts == null || texts.isEmpty() || texts.stream().anyMatch(s -> !hasText(s))) {
      return cb.conjunction();
    }

    Predicate[] predicates = texts.stream().map(text -> startWithText(paths, cb, text)).toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  public static Predicate startWithText(Expression<Object> paths, CriteriaBuilder cb, String text) {
    return cb.like(cb.lower(paths.as(String.class)), text.toLowerCase() + "%");
  }

  // -- NOT EMPTY --

  public static Predicate notEmpty(Expression<Object> paths, CriteriaBuilder cb, Class<?> type) {
    return empty(paths, cb, type).not();
  }

  // -- EMPTY --

  public static Predicate empty(Expression<Object> paths, CriteriaBuilder cb, Class<?> type) {
    Expression<Object> finalPaths;
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

  // -- DATE --

  public static Predicate greaterThanTexts(Expression<Object> paths, CriteriaBuilder cb, List<String> texts) {
    if (texts == null || texts.isEmpty()) {
      return cb.conjunction();
    }

    Predicate[] predicates = texts.stream()
        .map(value -> greaterThanText(paths, cb, value))
        .toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  public static Predicate greaterThanText(Expression<Object> paths, CriteriaBuilder cb, String text) {
    return cb.greaterThan(paths.as(Instant.class), Instant.parse(text));
  }

  public static Predicate greaterThanOrEqualTexts(Expression<Object> paths, CriteriaBuilder cb, List<String> texts) {
    if (texts == null || texts.isEmpty()) {
      return cb.conjunction();
    }

    Predicate[] predicates = texts.stream()
        .map(value -> greaterThanOrEqualText(paths, cb, value))
        .toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  public static Predicate greaterThanOrEqualText(Expression<Object> paths, CriteriaBuilder cb, String text) {
    return cb.greaterThanOrEqualTo(paths.as(Instant.class), Instant.parse(text));
  }

  public static Predicate lessThanTexts(Expression<Object> paths, CriteriaBuilder cb, List<String> texts) {
    if (texts == null || texts.isEmpty()) {
      return cb.conjunction();
    }

    Predicate[] predicates = texts.stream()
        .map(value -> lessThanText(paths, cb, value))
        .toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  public static Predicate lessThanText(Expression<Object> paths, CriteriaBuilder cb, String text) {
    return cb.lessThan(paths.as(Instant.class), Instant.parse(text));
  }

  public static Predicate lessThanOrEqualTexts(Expression<Object> paths, CriteriaBuilder cb, List<String> texts) {
    if (texts == null || texts.isEmpty()) {
      return cb.conjunction();
    }

    Predicate[] predicates = texts.stream()
        .map(value -> lessThanOrEqualText(paths, cb, value))
        .toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  public static Predicate lessThanOrEqualText(Expression<Object> paths, CriteriaBuilder cb, String text) {
    return cb.lessThanOrEqualTo(paths.as(Instant.class), Instant.parse(text));
  }


  // -- CUSTOM FUNCTION --

  private static Expression<String[]> lowerArray(Expression<?> paths, CriteriaBuilder cb)  {
    return stringToArray(lower(arrayToString(paths, cb), cb).as(String.class), cb);
  }

  // -- BASE FUNCTION --

  private static Expression<Boolean> arrayPosition(Expression<String[]> paths, CriteriaBuilder cb, Expression<String> text)  {
    return cb.function("array_position", Boolean.class, paths, text);
  }

  private static Expression<Object> lower(Expression<Object> paths, CriteriaBuilder cb)  {
    return cb.function("lower", Object.class, paths);
  }

  private static Expression<String[]> stringToArray(Expression<String> paths, CriteriaBuilder cb)  {
    return cb.function("string_to_array", String[].class, paths, cb.literal(" && "));
  }

  private static Expression<Object> arrayToString(Expression<?> paths, CriteriaBuilder cb)  {
    return cb.function("array_to_string", Object.class, paths, cb.literal(" && "));
  }

  private static Expression<String[]> avals(Expression<Object> paths, CriteriaBuilder cb)  {
    return cb.function("avals", String[].class, paths);
  }

}
