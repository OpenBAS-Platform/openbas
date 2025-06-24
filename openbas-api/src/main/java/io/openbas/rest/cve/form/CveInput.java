package io.openbas.rest.cve.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Cve;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import lombok.Getter;

@Getter
public class CveInput {

  @JsonProperty("cve_source_identifier")
  private String sourceIdentifier;

  @JsonProperty("cve_published")
  private Instant published;

  @JsonProperty("cve_description")
  private String description;

  @Enumerated(EnumType.STRING)
  @JsonProperty("cve_vuln_status")
  private Cve.VULNERABILITY_STATUS vulnStatus;

  @JsonProperty("cve_cvss")
  @NotNull
  @DecimalMin("0.0")
  @DecimalMax("10.0")
  private BigDecimal cvss;

  @JsonProperty("cve_cisa_exploit_add")
  private Instant cisaExploitAdd;

  @JsonProperty("cve_cisa_action_due")
  private Instant cisaActionDue;

  @JsonProperty("cve_cisa_required_action")
  private String cisaRequiredAction;

  @JsonProperty("cve_cisa_vulnerability_name")
  private String cisaVulnerabilityName;

  @JsonProperty("cve_remediation")
  private String remediation;

  @JsonProperty("cve_reference_urls")
  private List<String> referenceUrls;

  @JsonProperty("cve_cwes")
  private List<CweInput> cwes;
}
