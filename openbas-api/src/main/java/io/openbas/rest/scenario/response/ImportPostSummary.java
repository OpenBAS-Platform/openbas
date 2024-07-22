package io.openbas.rest.scenario.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ImportPostSummary {

  @JsonProperty("import_id")
  @NotBlank
  private String importId;

  @JsonProperty("available_sheets")
  @NotNull
  private List<String> availableSheets;

}
