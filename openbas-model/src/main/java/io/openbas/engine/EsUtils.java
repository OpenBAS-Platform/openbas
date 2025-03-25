package io.openbas.engine;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

public class EsUtils {

  public static List<String> buildRestrictions(String... ids) {
    List<String> restrictions = new ArrayList<>();
    List<String> filters = Arrays.stream(ids).filter(Objects::nonNull).toList();
    if (!filters.isEmpty()) {
      restrictions.addAll(filters);
    }
    if (restrictions.isEmpty()) {
      return null;
    }
    return restrictions;
  }
}
