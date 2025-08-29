package io.openbas.service;

import static io.openbas.database.model.Scenario.MAIN_FOCUS_INCIDENT_RESPONSE;
import static io.openbas.utils.SecurityAssessmentUtils.extractAndValidateAssessment;
import static io.openbas.utils.SecurityAssessmentUtils.extractAttackReferences;
import static io.openbas.utils.TimeUtils.getCronExpression;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.cron.ScheduleFrequency;
import io.openbas.database.model.*;
import io.openbas.database.model.MainFocus;
import io.openbas.database.model.Scenario;
import io.openbas.database.model.SecurityAssessment;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.database.repository.SecurityAssessmentRepository;
import io.openbas.rest.tag.TagService;
import io.openbas.service.cron.CronService;
import io.openbas.stix.objects.Bundle;
import io.openbas.stix.objects.ObjectBase;
import io.openbas.stix.parsing.Parser;
import io.openbas.stix.parsing.ParsingException;
import java.io.IOException;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class SecurityAssessmentService {

  public static final String STIX_ID = "id";
  public static final String STIX_THREAT_CONTEXT_REF = "threat_context_ref";
  public static final String STIX_NAME = "name";
  public static final String STIX_DESCRIPTION = "description";
  public static final String STIX_SCHEDULING = "scheduling";
  public static final String STIX_PERIOD_START = "period_start";
  public static final String STIX_PERIOD_END = "period_end";
  public static final String STIX_ATTACK_PATTERN_TYPE = "attack-pattern";
  public static final String ONE_SHOT = "X";

  private final ScenarioService scenarioService;
  private final TagService tagService;
  private final CronService cronService;
  private final SecurityAssessmentInjectService securityAssessmentInjectService;

  private final ScenarioRepository scenarioRepository;

  private final SecurityAssessmentRepository securityAssessmentRepository;

  private final Parser stixParser;
  private final ObjectMapper objectMapper;

  /**
   * Builds and persists a {@link SecurityAssessment} from a provided STIX JSON string.
   *
   * <p>This method parses the input STIX content, extracts relevant fields, maps them to a {@link
   * SecurityAssessment} domain object, and saves it. It also extracts referenced attack patterns
   * and sets optional fields like description and scheduling.
   *
   * @param stixJson STIX-formatted JSON string representing a security assessment
   * @return the saved {@link SecurityAssessment} object
   * @throws IOException if the input cannot be parsed into JSON
   * @throws ParsingException if the STIX bundle is malformed
   */
  public SecurityAssessment buildSecurityAssessmentFromStix(String stixJson)
      throws IOException, ParsingException {

    JsonNode root = objectMapper.readTree(stixJson);
    Bundle bundle = stixParser.parseBundle(root.toString());

    ObjectBase stixAssessmentObj = extractAndValidateAssessment(bundle);

    // Mandatory fields
    String externalId = stixAssessmentObj.getRequiredProperty(STIX_ID);
    SecurityAssessment securityAssessment = getByExternalIdOrCreateSecurityAssessment(externalId);
    securityAssessment.setExternalId(externalId);

    String threatContextRef = stixAssessmentObj.getRequiredProperty(STIX_THREAT_CONTEXT_REF);
    securityAssessment.setThreatContextRef(threatContextRef);

    String name = stixAssessmentObj.getRequiredProperty(STIX_NAME);
    securityAssessment.setName(name);

    // Optional fields
    stixAssessmentObj.setIfPresent(STIX_DESCRIPTION, securityAssessment::setDescription);

    // Extract Attack Patterns
    securityAssessment.setAttackPatternRefs(
        extractAttackReferences(bundle.findByType(STIX_ATTACK_PATTERN_TYPE)));

    // Default Fields
    String scheduling = stixAssessmentObj.getOptionalProperty(STIX_SCHEDULING, ONE_SHOT);
    try {
      securityAssessment.setScheduling(ScheduleFrequency.fromString(scheduling));
    } catch (IllegalArgumentException iae) {
      throw new ParsingException(
          String.format("Error parsing scheduling on security assessment: %s", iae.getMessage()),
          iae);
    }

    // Period Start & End
    stixAssessmentObj.setInstantIfPresent(STIX_PERIOD_START, securityAssessment::setPeriodStart);
    stixAssessmentObj.setInstantIfPresent(STIX_PERIOD_END, securityAssessment::setPeriodEnd);

    securityAssessment.setContent(stixAssessmentObj.toStix(objectMapper).toString());
    return save(securityAssessment);
  }

  /**
   * Retrieves a {@link SecurityAssessment} by its external ID. If no existing assessment is found,
   * a new instance is returned.
   *
   * @param externalId the external identifier from the STIX content
   * @return an existing or new {@link SecurityAssessment}
   */
  public SecurityAssessment getByExternalIdOrCreateSecurityAssessment(String externalId) {
    return securityAssessmentRepository
        .findByExternalId(externalId)
        .orElseGet(SecurityAssessment::new);
  }

  /**
   * Persists {@link SecurityAssessment} to the repository.
   *
   * @param securityAssessment the security assessment to save
   * @return the saved {@link SecurityAssessment}
   */
  public SecurityAssessment save(SecurityAssessment securityAssessment) {
    return securityAssessmentRepository.save(securityAssessment);
  }

  /**
   * Builds a {@link Scenario} object based on a given {@link SecurityAssessment}.
   *
   * <p>This will create or update the associated scenario and generate the appropriate injects by
   * delegating to the {@code securityAssessmentInjectService}.
   *
   * @param securityAssessment the source assessment
   * @return the created or updated {@link Scenario}
   */
  public Scenario buildScenarioFromSecurityAssessment(SecurityAssessment securityAssessment) {
    Scenario scenario = updateOrCreateScenarioFromSecurityAssessment(securityAssessment);
    securityAssessment.setScenario(scenario);
    securityAssessmentInjectService.createdInjectsForScenario(scenario, securityAssessment);
    return scenario;
  }

  /**
   * Updates an existing {@link Scenario} from a {@link SecurityAssessment}, or creates one if none
   * is associated with the assessment.
   *
   * @param securityAssessment the {@link SecurityAssessment}
   * @return the updated or newly created {@link Scenario}
   */
  public Scenario updateOrCreateScenarioFromSecurityAssessment(
      SecurityAssessment securityAssessment) {
    if (securityAssessment.getScenario() != null) {
      return scenarioRepository
          .findById(securityAssessment.getScenario().getId())
          .map(existing -> updateScenarioFromSecurityAssessment(existing, securityAssessment))
          .orElseGet(() -> createAndInitializeScenario(securityAssessment));
    }
    return createAndInitializeScenario(securityAssessment);
  }

  private Scenario createAndInitializeScenario(SecurityAssessment securityAssessment) {
    Scenario scenario = new Scenario();
    updatePropertiesFromSecurityAssessment(scenario, securityAssessment);
    return scenarioService.createScenario(scenario);
  }

  private Scenario updateScenarioFromSecurityAssessment(
      Scenario scenario, SecurityAssessment securityAssessment) {
    updatePropertiesFromSecurityAssessment(scenario, securityAssessment);
    return scenarioService.updateScenario(scenario);
  }

  private void updatePropertiesFromSecurityAssessment(Scenario scenario, SecurityAssessment sa) {
    scenario.setSecurityAssessment(sa);
    scenario.setName(sa.getName());
    scenario.setDescription(sa.getDescription());
    scenario.setSeverity(Scenario.SEVERITY.high);
    scenario.setMainFocus(MainFocus.INCIDENT_RESPONSE.toString());

    Instant start = sa.getPeriodStart();
    Instant end = sa.getPeriodEnd();

    scenario.setRecurrenceStart(start);
    scenario.setRecurrenceEnd(end);

    String cron = cronService.getCronExpression(sa.getScheduling(), start);
    scenario.setRecurrence(cron);

    scenario.setTags(tagService.buildDefaultTagsForStix());
  }
}
