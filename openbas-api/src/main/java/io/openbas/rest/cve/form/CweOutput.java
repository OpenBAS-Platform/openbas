package io.openbas.rest.cve.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Setter;

@Setter
@Builder
public class CweOutput {

  @NotBlank
  @JsonProperty("cwe_id")
  private String id;

  @JsonProperty("cwe_value")
  private String value;

  @JsonProperty("cwe_source")
  private String source;
}
