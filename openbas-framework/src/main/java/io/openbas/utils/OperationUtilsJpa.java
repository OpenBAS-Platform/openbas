package io.openbas.utils;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;

import java.util.List;

public class OperationUtilsJpa {

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
      List<String> texts, Class<?> type) {
    Predicate[] predicates = texts.stream().map(text -> containsText(paths, cb, text, type)).toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  public static Predicate containsText(Expression<String> paths, CriteriaBuilder cb, String text, Class<?> type) {
    if (type.isArray()) {
      return cb.like(
          cb.function("array_to_string", String.class, paths, cb.literal(" ")),
          "%" + text.toLowerCase() + "%"
      );
    }
    return cb.like(cb.lower(paths), "%" + text.toLowerCase() + "%");
  }

  // -- NOT EQUALS --

  public static Predicate notEqualsTexts(Expression<String> paths, CriteriaBuilder cb, List<String> texts) {
    Predicate[] predicates = texts.stream().map(text -> notEqualsText(
        paths, cb, text
    )).toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  private static Predicate notEqualsText(Expression<String> paths, CriteriaBuilder cb, String text) {
    return equalsText(paths, cb, text).not();
  }

  // -- EQUALS --

  public static Predicate equalsTexts(Expression<String> paths, CriteriaBuilder cb, List<String> texts) {
    Predicate[] predicates = texts.stream().map(text -> equalsText(
        paths, cb, text
    )).toArray(Predicate[]::new);

    return cb.or(predicates);
  }

  private static Predicate equalsText(Expression<String> paths, CriteriaBuilder cb, String text) {
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

}
