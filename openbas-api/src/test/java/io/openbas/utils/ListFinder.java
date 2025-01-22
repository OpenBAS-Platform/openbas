package io.openbas.utils;

import java.util.Collection;
import java.util.function.Predicate;
import org.apache.poi.ss.formula.functions.T;

public class ListFinder {
  public static <T> T findByProperty(Collection<T> col, Predicate<T> filter) {
    return col.stream()
        .filter(filter)
        .findFirst()
        .orElseThrow(() -> new RuntimeException("No element matching filter"));
  }
}
