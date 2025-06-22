package io.openbas.rest.cve.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class CveCreateInput extends CveInput {

  @JsonProperty("cve_id")
  @NotNull
  private String id;
}
