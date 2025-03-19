package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContractOutputElement {

  @NotBlank
  @JsonProperty("group")
  private int group;

  @NotBlank
  @JsonProperty("label")
  private String label;

  @NotBlank
  @JsonProperty("key")
  private String key;

  @NotBlank
  @JsonProperty("type")
  private ContractOutputType type;
}
