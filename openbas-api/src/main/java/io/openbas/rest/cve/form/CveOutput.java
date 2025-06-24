package io.openbas.rest.cve.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Cve;
import java.time.Instant;
import java.util.List;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Setter
@SuperBuilder
public class CveOutput extends CveSimple {

  @JsonProperty("cve_source_identifier")
  private String sourceIdentifier;

  @JsonProperty("cve_description")
  private String description;

  @JsonProperty("cve_vuln_status")
  private Cve.VULNERABILITY_STATUS vulnStatus;

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
  private List<CweOutput> cwes;
}
