package io.openbas.service;

import io.openbas.database.model.Scenario;
import io.openbas.database.model.SecurityCoverage;
import io.openbas.stix.parsing.ParsingException;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@RequiredArgsConstructor
@Service
public class StixService {

  private final SecurityCoverageService securityCoverageService;

  @Transactional(rollbackFor = Exception.class)
  public String processBundle(String stixJson) throws IOException, ParsingException {
    // Update securityCoverage with the last bundle
    SecurityCoverage securityCoverage =
        securityCoverageService.buildSecurityCoverageFromStix(stixJson);
    // Update Scenario using the last SecurityCoverage
    Scenario scenario = securityCoverageService.buildScenarioFromSecurityCoverage(securityCoverage);
    return scenario.getId();
  }
}
