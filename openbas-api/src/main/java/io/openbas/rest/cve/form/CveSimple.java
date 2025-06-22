package io.openbas.rest.cve.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Setter
@SuperBuilder
public class CveSimple {

  @NotBlank
  @JsonProperty("cve_id")
  private String id;

  @NotBlank
  @JsonProperty("cve_cvss")
  private BigDecimal cvss;

  @JsonProperty("cve_published")
  private Instant published;
}
