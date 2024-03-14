package io.openbas.utils.pagination;

import io.openbas.helper.SupportedLanguage;
import org.springframework.data.domain.Sort;

import java.time.Instant;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.utils.schema.SchemaUtils.getPropertyInfo;
import static io.openbas.utils.schema.SchemaUtils.toJavaFieldPath;
import static java.util.Comparator.comparing;

public class SortUtils {

  public static Comparator<Object> computeSort(PaginationField input) {
    Sort sort = input.getSort();

    Comparator<Object> comparator = (a, b) -> 0;

    for (Sort.Order order : sort) {
      Comparator<Object> propertyComparator = comparing(
          value -> {
            String javaFieldPath = toJavaFieldPath(value.getClass(), order.getProperty());
            return getPropertyValue(value, javaFieldPath);
          });

      comparator = comparator.thenComparing(
          order.getDirection().equals(Sort.Direction.ASC)
              ? propertyComparator
              : propertyComparator.reversed()
      );
    }

    return comparator;
  }

  private static Comparable<Object> EMPTY_COMPARABLE = o -> 0;

  @SuppressWarnings("unchecked")
  public static Comparable<Object> getPropertyValue(Object obj, String path) {
    Entry<Class<Object>, Object> entry = getPropertyInfo(obj, path);
    if (entry == null || entry.getValue() == null) {
      return EMPTY_COMPARABLE;
    }
    if (Arrays.stream(BASE_CLASSES).anyMatch(c -> entry.getKey().isAssignableFrom(c))) {
      return (Comparable<Object>) entry.getValue();
      // Handle map with Supported language
    } else if (entry.getKey().isAssignableFrom(Map.class)
        || entry.getKey().getName().contains("ImmutableCollections")) {
      Set<Entry> entries = ((Map) entry.getValue()).entrySet();
      if (entries.stream().anyMatch(e -> e.getKey().getClass().isAssignableFrom(SupportedLanguage.class))) {
        SupportedLanguage lang = SupportedLanguage.of(currentUser().getLang());
        return (Comparable<Object>) entries.stream()
            .filter(e -> lang.equals(e.getKey()))
            .findFirst()
            .map(Entry::getValue)
            .orElse(EMPTY_COMPARABLE);
      } else {
        return EMPTY_COMPARABLE;
      }
    } else {
      throw new UnsupportedOperationException("Sorting is not implemented for other property than String and Long");
    }
  }

  private static final Class<?>[] BASE_CLASSES = {
      Long.class,
      Instant.class,
      String.class,
  };

}
