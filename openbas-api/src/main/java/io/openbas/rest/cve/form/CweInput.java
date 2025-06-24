package io.openbas.rest.cve.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class CweInput {

  @JsonProperty("cwe_id")
  @NotBlank
  private String id;

  @JsonProperty("cwe_source")
  private String source;
}
