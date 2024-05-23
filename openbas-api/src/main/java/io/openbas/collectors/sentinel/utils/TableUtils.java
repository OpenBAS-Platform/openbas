package io.openbas.collectors.sentinel.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.collectors.sentinel.domain.Column;
import io.openbas.collectors.sentinel.domain.QueryResult;
import io.openbas.collectors.sentinel.domain.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.*;
import java.util.stream.IntStream;

import static io.openbas.collectors.sentinel.domain.Table.*;
import static org.springframework.util.StringUtils.hasText;

public class TableUtils {

  private static final ObjectMapper objectMapper = new ObjectMapper();

  public static final String PRIMARY_RESULT = "primaryresult";

  public static final String TIME_GENERATED = "TimeGenerated";
  public static final String ALERT_NAME = "AlertName";
  public static final String ALERT_SEVERITY = "AlertSeverity";
  public static final String DESCRIPTION = "description";
  public static final String EXTENDED_PROPERTIES = "ExtendedProperties";
  public static final String ENTITIES = "entities";
  public static final String ALERT_LINK = "AlertLink";

  // -- QUERY RESULT --

  public static Optional<Table> extractTableFromQueryResult(@NotNull final QueryResult queryResult) {
    return queryResult.getTables()
        .stream()
        .filter(t -> PRIMARY_RESULT.equalsIgnoreCase(t.getName()))
        .findFirst();
  }

  public static Map<String, Integer> computeIndexPropertyFromTable(@NotNull final Table table) {
    Map<String, Integer> map = new HashMap<>();
    map.put(TIME_GENERATED, findIndexPropertyFromTable(table, TIME_GENERATED));
    map.put(ALERT_NAME, findIndexPropertyFromTable(table, ALERT_NAME));
    map.put(EXTENDED_PROPERTIES, findIndexPropertyFromTable(table, EXTENDED_PROPERTIES));
    map.put(ENTITIES, findIndexPropertyFromTable(table, ENTITIES));
    map.put(DESCRIPTION, findIndexPropertyFromTable(table, DESCRIPTION));
    map.put(ALERT_SEVERITY, findIndexPropertyFromTable(table, ALERT_SEVERITY));
    map.put(ALERT_LINK, findIndexPropertyFromTable(table, ALERT_LINK));
    return map;
  }

  private static int findIndexPropertyFromTable(@NotNull final Table table, @NotBlank final String property) {
    List<Column> columns = table.getColumns();
    if (columns == null) {
      return -1;
    }
    return IntStream.range(0, columns.size())
        .filter(i -> property.equalsIgnoreCase(columns.get(i).getName()))
        .findFirst()
        .orElse(-1);
  }

  // -- ACTION --

  public static boolean isValidAction(@NotBlank final String action) {
    return hasText(action) && ACTIONS.contains(action);
  }

  public static boolean isActionPrevention(@NotBlank final String action) {
    return List.of(BLOCKED, QUARANTINE).contains(action.toLowerCase());
  }

  public static boolean isActionDetection(@NotBlank String action) {
    return List.of(LOGGED, DETECTED).contains(action.toLowerCase());
  }

  // -- ENTITIES --

  public static List<LinkedHashMap<String, Object>> entitiesFromRow(
      @NotNull final List<String> row,
      @NotNull final Map<String, Integer> propertyMap) {
    String entitiesString = row.get(propertyMap.get(ENTITIES));
    try {
      return objectMapper.readValue(
          entitiesString,
          new TypeReference<>() {
          });
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

  // -- EXTENDED PROPERTIES --

  public static LinkedHashMap<String, Object> extendedPropertiesFromRow(
      @NotNull final List<String> row,
      @NotNull final Map<String, Integer> propertyMap) {
    String extendedPropertiesString = row.get(propertyMap.get(EXTENDED_PROPERTIES));
    try {
      return objectMapper.readValue(
          extendedPropertiesString,
          new TypeReference<>() {
          });
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

}
