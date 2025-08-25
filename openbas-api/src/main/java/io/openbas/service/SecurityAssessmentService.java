package io.openbas.service;

import static io.openbas.service.TagRuleService.OPENCTI_TAG_NAME;
import static io.openbas.utils.SecurityAssessmentUtils.*;
import static io.openbas.utils.TimeUtils.getCronExpression;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import io.openbas.database.repository.SecurityAssessmentRepository;
import io.openbas.rest.attack_pattern.service.AttackPatternService;
import io.openbas.rest.inject.form.InjectAssistantInput;
import io.openbas.rest.inject.service.InjectAssistantService;
import io.openbas.rest.inject.service.InjectService;
import io.openbas.rest.tag.TagService;
import io.openbas.rest.tag.form.TagCreateInput;
import io.openbas.stix.objects.Bundle;
import io.openbas.stix.objects.ObjectBase;
import io.openbas.stix.parsing.Parser;
import io.openbas.stix.parsing.ParserHelper;
import io.openbas.stix.parsing.ParsingException;
import io.openbas.stix.types.Identifier;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class SecurityAssessmentService {

  public static final String OPENCTI_TAG_COLOR = "#001bda";
  public static final String INCIDENT_RESPONSE = "incident-response";
  public static final String STIX_ID = "id";
  public static final String STIX_THREAT_CONTEXT_REF = "threat_context_ref";
  public static final String STIX_NAME = "name";
  public static final String STIX_DESCRIPTION = "description";
  public static final String STIX_OBJECT_REFS = "object_refs";
  public static final String STIX_SCHEDULING = "scheduling";
  public static final String STIX_PERIOD_START = "period_start";
  public static final String STIX_PERIOD_END = "period_end";
  public static final String ONE_SHOT = "X";

  private final ScenarioService scenarioService;
  private final TagService tagService;
  private final TagRuleService tagRuleService;
  private final InjectAssistantService injectAssistantService;
  private final AttackPatternService attackPatternService;
  private final InjectService injectService;

  private final SecurityAssessmentRepository securityAssessmentRepository;

  private final Parser stixParser;
  private final ParserHelper parserHelper;
  private final ObjectMapper objectMapper;

  public SecurityAssessment buildSecurityAssessmentFromStix(String stixJson)
      throws IOException, ParsingException {

    JsonNode root = objectMapper.readTree(stixJson);
    Bundle bundle = stixParser.parseBundle(root.toString());

    ObjectBase stixAssessmentObj = extractAndValidateAssessment(bundle);

    // Mandatory fields
    String externalId = parserHelper.getRequiredProperty(stixAssessmentObj, STIX_ID);
    SecurityAssessment securityAssessment = getByExternalIdOrCreateSecurityAssessment(externalId);
    securityAssessment.setExternalId(externalId);

    String threatContextRef =
        parserHelper.getRequiredProperty(stixAssessmentObj, STIX_THREAT_CONTEXT_REF);
    securityAssessment.setThreatContextRef(threatContextRef);

    // Optional fields
    parserHelper.setIfPresent(stixAssessmentObj, STIX_NAME, securityAssessment::setName);
    parserHelper.setIfPresent(
        stixAssessmentObj, STIX_DESCRIPTION, securityAssessment::setDescription);

    // Object refs (extract attack patterns and vulnerabilities)
    if (stixAssessmentObj.hasProperty(STIX_OBJECT_REFS)) {
      List<ObjectBase> relatedObjects =
          bundle.findByIds(
              (List<Identifier>) stixAssessmentObj.getProperty(STIX_OBJECT_REFS).getValue());
      securityAssessment.setAttackPatternRefs(extractObjectReferences(relatedObjects));
    }

    // Default Fields
    String scheduling =
        parserHelper.getOptionalProperty(stixAssessmentObj, STIX_SCHEDULING, ONE_SHOT);
    securityAssessment.setScheduling(scheduling);

    // Period Start & End
    parserHelper.setInstantIfPresent(
        stixAssessmentObj, STIX_PERIOD_START, securityAssessment::setPeriodStart);
    parserHelper.setInstantIfPresent(
        stixAssessmentObj, STIX_PERIOD_END, securityAssessment::setPeriodEnd);

    securityAssessment.setContent(stixJson);
    return save(securityAssessment);
  }

  public Scenario buildScenarioFromSecurityAssessment(SecurityAssessment securityAssessment) {
    Scenario scenario =
        scenarioService.getOrCreateScenarioFromSecurityAssessment(securityAssessment);
    updateScenarioFromSecurityAssessment(scenario, securityAssessment);
    createdInjectsForScenario(scenario, securityAssessment);
    return scenario;
  }

  private Scenario updateScenarioFromSecurityAssessment(
      Scenario scenario, SecurityAssessment securityAssessment) {

    scenario.setSecurityAssessment(securityAssessment);

    scenario.setName(securityAssessment.getName());
    scenario.setDescription(securityAssessment.getDescription());
    scenario.setSeverity(Scenario.SEVERITY.high);
    scenario.setMainFocus(INCIDENT_RESPONSE);

    Instant start = securityAssessment.getPeriodStart();
    Instant end = securityAssessment.getPeriodEnd();

    scenario.setRecurrenceStart(start);
    scenario.setRecurrenceEnd(end);

    String cron = getCronExpression(securityAssessment.getScheduling(), start);
    scenario.setRecurrence(cron);

    scenario.setTags(Set.of(buildDefaultTags()));

    scenarioService.computeEmails(scenario);

    return scenarioService.updateScenario(scenario);
  }

  private SecurityAssessment getByExternalIdOrCreateSecurityAssessment(String externalId) {
    return securityAssessmentRepository
        .findByExternalId(externalId)
        .orElseGet(SecurityAssessment::new);
  }

  private SecurityAssessment save(SecurityAssessment securityAssessment) {
    return securityAssessmentRepository.save(securityAssessment);
  }

  private void createdInjectsForScenario(Scenario scenario, SecurityAssessment securityAssessment) {
    // Every time we remove all injects related to this scenario, if it is an update of scenario,
    // all inject will be removed
    injectService.deleteAll(scenario.getInjects());

    // Fetch internal Ids for TTPs
    List<String> attackPatternIds =
        attackPatternService
            .getAttackPatternsByExternalIdsThrowIfMissing(
                securityAssessment.getAttackPatternRefs().stream()
                    .map(StixRefToExternalRef::getExternalRef)
                    .collect(Collectors.toSet()))
            .stream()
            .map(AttackPattern::getId)
            .toList();

    // Fetch Endpoints based on Tag rules: opencti
    List<String> tagIds = scenario.getTags().stream().map(Tag::getId).toList();
    List<String> assetGroupsLinkedToTagRules =
        tagRuleService.getAssetGroupsFromTagIds(tagIds).stream().map(ag -> ag.getId()).toList();

    // Build Input for InjectAssistant
    InjectAssistantInput input = new InjectAssistantInput();
    input.setAttackPatternIds(attackPatternIds);
    input.setAssetGroupIds(assetGroupsLinkedToTagRules);

    // Build injects for these TTPs and added to Scenario
    // If TTPs is empty then none inject is created
    injectAssistantService.generateInjectsForScenario(scenario, input);
  }

  private Tag buildDefaultTags() {
    // Set Default Tag OCTI for every created scenario from a STIX bundle
    TagCreateInput tagCreateInput = new TagCreateInput();
    tagCreateInput.setName(OPENCTI_TAG_NAME);
    tagCreateInput.setColor(OPENCTI_TAG_COLOR);

    Tag octiTag = tagService.upsertTag(tagCreateInput);
    return octiTag;
  }
}
