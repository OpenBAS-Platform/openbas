package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
public class InjectImportInput {
  @JsonProperty("target")
  @NotBlank
  private InjectImportTargetDefinition target;

  public InjectImportInput() {}
}
