package io.openbas.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
@Service
public class StixService {

  public List<String> generateScenarioFromSTIXBundle(String stixJson)
      throws IOException, ParsingException {
    JsonNode root = objectMapper.readTree(stixJson);
    Bundle bundle = stixParser.parseBundle(root.toString());

    List<String> createdScenarios = new ArrayList<>();

    for (ObjectBase obj :
        bundle.findByType(
            "x-security-assessment")) { // Maybe we could have various security assestments
      String id = (String) obj.getProperty("id").getValue();
      SecurityAssessment securityAssessment = getOrCreateSecurityAssessment(id);
      Scenario scenario = getOrCreateScenario(securityAssessment);
      ;

      updateSecurityAssessmentFromStix(obj, bundle, scenario, securityAssessment);
      securityAssessment.setScenario(scenario);
      SecurityAssessment savedSecurity = securityAssessmentRepository.save(securityAssessment);

      // Create Scenario using SecurityAssessment
      scenario = createScenarioFromSecurityAssessment(scenario, savedSecurity);
      scenario
          .getTags()
          .add(tagRepository.findByName("opencti").get()); // TODO Set tags based in labels

      // Creation injects based attack patterns from stix
      createdInjectsForScenario(securityAssessment, scenario);

      createdScenarios.add(scenario.getId());
    }
    return createdScenarios;
  }

  private void updateSecurityAssessmentFromStix(
      ObjectBase stixAssessmentObj,
      Bundle bundle,
      Scenario scenario,
      SecurityAssessment securityAssessment)
      throws ParsingException, JsonProcessingException {
    if (scenario.getFrom() == null) scenario.setFrom("toto@gmail.com"); // TODO change

    securityAssessment.setExternalId((String) stixAssessmentObj.getProperty("id").getValue());
    securityAssessment.setName((String) stixAssessmentObj.getProperty("name").getValue());
    securityAssessment.setDescription(
        (String) stixAssessmentObj.getProperty("description").getValue());
    securityAssessment.setSecurityCoverageSubmissionUrl(
        (String) stixAssessmentObj.getProperty("security_coverage_submission_url").getValue());

    securityAssessment.setScheduling(
        (String) stixAssessmentObj.getProperty("scheduling").getValue());

    if (stixAssessmentObj.hasProperty("period_start")
        && stixAssessmentObj.getProperty("period_start") != null) {
      securityAssessment.setPeriodStart(
          Instant.parse((String) stixAssessmentObj.getProperty("period_start").getValue()));
    }
    if (stixAssessmentObj.hasProperty("period_end")
        && stixAssessmentObj.getProperty("period_end") != null) {
      securityAssessment.setPeriodEnd(
          Instant.parse((String) stixAssessmentObj.getProperty("period_end").getValue()));
    }

    String threatContextRef =
        (String) stixAssessmentObj.getProperty("threat_context_ref").getValue();
    securityAssessment.setThreatContextRef(threatContextRef);

    // Attack pattern refs -> convert to MITRE IDs
    securityAssessment.setAttackPatternRefs(
        extractAttackPatterns(
            bundle.findByIds(
                (List<Identifier>)
                    stixAssessmentObj.getProperty("attack_pattern_refs").getValue())));

    // Add vulnerabilities
    // TODO Add labels as upsert tags
  }

  private SecurityAssessment getOrCreateSecurityAssessment(String externalId) {
    return securityAssessmentRepository
        .findByExternalId(externalId)
        .orElseGet(SecurityAssessment::new);
  }

  private Scenario getOrCreateScenario(SecurityAssessment sa) {
    if (sa.getScenario() != null) {
      return scenarioRepository.findById(sa.getScenario().getId()).orElseGet(Scenario::new);
    }
    return new Scenario();
  }

  private void createdInjectsForScenario(SecurityAssessment securityAssessment, Scenario scenario) {
    InjectAssistantInput input = new InjectAssistantInput();
    List<String> attackPatternIds =
        attackPatternService
            .getAttackPatternsByExternalIdsThrowIfMissing(
                securityAssessment.getAttackPatternRefs().stream()
                    .map(StixRefToExternalRef::getExternalRef)
                    .collect(Collectors.toSet()))
            .stream()
            .map(AttackPattern::getId)
            .toList();
    input.setAttackPatternIds(attackPatternIds); // TODO Add ttps to placeholders
    injectAssistantService.generateInjectsForScenario(scenario, input);
  }

  private List<StixRefToExternalRef> extractAttackPatterns(List<ObjectBase> objects) {
    List<StixRefToExternalRef> stixToMitre = new ArrayList<>();
    for (ObjectBase obj : objects) {
      String stixId = (String) obj.getProperty("id").getValue();
      String mitreId = (String) obj.getProperty("x_mitre_id").getValue();
      if (mitreId != null) {
        StixRefToExternalRef stixRef = new StixRefToExternalRef(stixId, mitreId);
        stixToMitre.add(stixRef);
      }
    }
    return stixToMitre;
  }

  private Scenario createScenarioFromSecurityAssessment(
      Scenario scenario, SecurityAssessment securityAssessment) {
    scenario.setSecurityAssessment(securityAssessment);
    scenario.setName(securityAssessment.getName());
    scenario.setDescription(securityAssessment.getDescription());
    scenario.setSeverity(Scenario.SEVERITY.high);
    scenario.setMainFocus("incident-response");

    Instant start = securityAssessment.getPeriodStart();
    Instant end = securityAssessment.getPeriodEnd();

    scenario.setRecurrenceStart(start);
    scenario.setRecurrenceEnd(end);

    String cron = getCronExpression(securityAssessment.getScheduling(), start);
    scenario.setRecurrence(cron);

    injectService.deleteAll(scenario.getInjects());
    return scenarioRepository.save(scenario);
  }

  private String getCronExpression(String scheduling, Instant start) {
    ZonedDateTime zdt = start.atZone(ZoneId.systemDefault());
    int minute = zdt.getMinute();
    int hour = zdt.getHour();
    int dayOfMonth = zdt.getDayOfMonth();
    int dayOfWeek = zdt.getDayOfWeek().getValue();

    switch (scheduling) {
      case "d": // daily
        return String.format("0 %d %d * * *", minute, hour);
      case "w": // weekly
        return String.format("0 %d %d * * %d", minute, hour, dayOfWeek);
      case "m": // monthly
        return String.format("0 %d %d %d * *", minute, hour, dayOfMonth);
      case "X": // one-shot
        return null;
      default:
        throw new IllegalArgumentException("Unknown scheduling type: " + scheduling);
    }
  }
}
