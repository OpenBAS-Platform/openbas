package io.openbas.rest.scenario.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class ImportPostSummary {

  @JsonProperty("import_id")
  private String importId;

  @JsonProperty("available_sheets")
  private List<String> availableSheets;

}
