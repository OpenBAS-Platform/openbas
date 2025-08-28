package io.openbas.service;

import static io.openbas.utils.TimeUtils.getCronExpression;

import io.openbas.database.model.Scenario;
import io.openbas.database.model.SecurityAssessment;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.rest.tag.TagService;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@RequiredArgsConstructor
@Service
@Slf4j
@Validated
public class ScenarioSecurityAssessmentService {

  public static final String INCIDENT_RESPONSE = "incident-response";

  private final ScenarioService scenarioService;
  private final TagService tagService;
  private final InjectSecurityAssessmentService injectSecurityAssessmentService;

  private final ScenarioRepository scenarioRepository;

  public Scenario buildScenarioFromSecurityAssessment(SecurityAssessment securityAssessment) {
    Scenario scenario = updateOrCreateScenarioFromSecurityAssessment(securityAssessment);
    securityAssessment.setScenario(scenario);
    injectSecurityAssessmentService.createdInjectsForScenario(scenario, securityAssessment);
    return scenario;
  }

  public Scenario updateOrCreateScenarioFromSecurityAssessment(SecurityAssessment sa) {
    if (sa.getScenario() != null) {
      return scenarioRepository
          .findById(sa.getScenario().getId())
          .map(existing -> updateScenarioFromSecurityAssessment(existing, sa))
          .orElseGet(() -> createAndInitializeScenario(sa));
    }
    return createAndInitializeScenario(sa);
  }

  private Scenario createAndInitializeScenario(SecurityAssessment sa) {
    Scenario scenario = new Scenario();
    updatePropertiesFromSecurityAssessment(scenario, sa);
    return scenarioService.createScenario(scenario);
  }

  private Scenario updateScenarioFromSecurityAssessment(Scenario scenario, SecurityAssessment sa) {
    updatePropertiesFromSecurityAssessment(scenario, sa);
    return scenarioService.updateScenario(scenario);
  }

  private void updatePropertiesFromSecurityAssessment(Scenario scenario, SecurityAssessment sa) {
    scenario.setSecurityAssessment(sa);
    scenario.setName(sa.getName());
    scenario.setDescription(sa.getDescription());
    scenario.setSeverity(Scenario.SEVERITY.high);
    scenario.setMainFocus(INCIDENT_RESPONSE);

    Instant start = sa.getPeriodStart();
    Instant end = sa.getPeriodEnd();

    scenario.setRecurrenceStart(start);
    scenario.setRecurrenceEnd(end);

    String cron = getCronExpression(sa.getScheduling(), start);
    scenario.setRecurrence(cron);

    scenario.setTags(tagService.buildDefaultTagsForStix());
  }
}
