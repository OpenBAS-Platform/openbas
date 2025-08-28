package io.openbas.service;

import io.openbas.database.model.Scenario;
import io.openbas.database.model.SecurityAssessment;
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

  private final SecurityAssessmentService securityAssessmentService;

  @Transactional(rollbackFor = Exception.class)
  public String processBundle(String stixJson) throws IOException, ParsingException {
    // Update securityAssessment with the last bundle
    SecurityAssessment securityAssessment =
        securityAssessmentService.buildSecurityAssessmentFromStix(stixJson);
    // Update Scenario using the last SecurityAssessment
    Scenario scenario =
        securityAssessmentService.buildScenarioFromSecurityAssessment(securityAssessment);
    return scenario.getId();
  }
}
