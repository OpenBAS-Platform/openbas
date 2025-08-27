package io.openbas.service;

import static io.openbas.utils.SecurityAssessmentUtils.extractAndValidateAssessment;
import static io.openbas.utils.SecurityAssessmentUtils.extractAttackReferences;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.cron.ScheduleFrequency;
import io.openbas.database.model.*;
import io.openbas.database.repository.SecurityAssessmentRepository;
import io.openbas.stix.objects.Bundle;
import io.openbas.stix.objects.ObjectBase;
import io.openbas.stix.parsing.Parser;
import io.openbas.stix.parsing.ParsingException;
import java.io.IOException;
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

  private final SecurityAssessmentRepository securityAssessmentRepository;

  private final Parser stixParser;
  private final ObjectMapper objectMapper;

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

  private SecurityAssessment getByExternalIdOrCreateSecurityAssessment(String externalId) {
    return securityAssessmentRepository
        .findByExternalId(externalId)
        .orElseGet(SecurityAssessment::new);
  }

  public SecurityAssessment save(SecurityAssessment securityAssessment) {
    return securityAssessmentRepository.save(securityAssessment);
  }
}
