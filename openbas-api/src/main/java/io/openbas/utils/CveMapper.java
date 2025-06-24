package io.openbas.utils;

import io.openbas.database.model.Cve;
import io.openbas.database.model.Cwe;
import io.openbas.rest.cve.form.CveOutput;
import io.openbas.rest.cve.form.CveSimple;
import io.openbas.rest.cve.form.CweOutput;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
@Slf4j
public class CveMapper {

  public CveSimple toCveSimple(Cve cve) {
    return CveSimple.builder()
        .id(cve.getId())
        .cvss(cve.getCvss())
        .published(cve.getPublished())
        .build();
  }

  public CveOutput toCveOutput(Cve cve) {
    return CveOutput.builder()
        .id(cve.getId())
        .cvss(cve.getCvss())
        .published(cve.getPublished())
        .description(cve.getDescription())
        .vulnStatus(cve.getVulnStatus())
        .cisaActionDue(cve.getCisaActionDue())
        .cisaExploitAdd(cve.getCisaExploitAdd())
        .cisaRequiredAction(cve.getCisaRequiredAction())
        .cisaVulnerabilityName(cve.getCisaVulnerabilityName())
        .remediation(cve.getRemediation())
        .referenceUrls(new ArrayList<>(cve.getReferenceUrls()))
        .cwes(toCweOutputs(cve.getCwes()))
        .build();
  }

  private List<CweOutput> toCweOutputs(List<Cwe> cwes) {
    return cwes.stream().map(this::toCweOutput).collect(Collectors.toList());
  }

  public CweOutput toCweOutput(Cwe cwe) {
    return CweOutput.builder().id(cwe.getId()).source(cwe.getSource()).build();
  }
}
