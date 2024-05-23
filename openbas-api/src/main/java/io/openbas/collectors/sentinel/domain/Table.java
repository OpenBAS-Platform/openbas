package io.openbas.collectors.sentinel.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.LinkedHashMap;
import java.util.List;

import static java.util.Optional.ofNullable;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Table {

  private String name;
  private List<Column> columns;
  private List<List<String>> rows;

  // -- EXTENDED PROPERTIES --

  public static String BLOCKED = "blocked";
  public static String QUARANTINE = "quarantine";
  public static String LOGGED = "logged";
  public static String DETECTED = "detected";
  public static List<String> ACTIONS = List.of(BLOCKED, QUARANTINE, LOGGED, DETECTED);

  public static String getAction(LinkedHashMap<String, Object> extendedProperties) {
    return ofNullable((String) extendedProperties.get("Action")).orElse("");
  }

  public static String getIncidentId(LinkedHashMap<String, Object> extendedProperties) {
    return ofNullable((String) extendedProperties.get("IncidentId")).orElse("");
  }

  public static class Entities {
    public static String getHostName(LinkedHashMap<String, Object> entities) {
      return ofNullable((String) entities.get("HostName")).orElse("");
    }

    public static String getCommandLine(LinkedHashMap<String, Object> entities) {
      return ofNullable((String) entities.get("CommandLine")).orElse("");
    }
  }

}
