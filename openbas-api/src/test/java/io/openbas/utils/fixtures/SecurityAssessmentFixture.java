package io.openbas.utils.fixtures;

import io.openbas.cron.ScheduleFrequency;
import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.SecurityAssessment;
import io.openbas.database.model.StixRefToExternalRef;
import java.util.List;
import java.util.UUID;

public class SecurityAssessmentFixture {
  public static SecurityAssessment createDefaultSecurityAssessment() {
    SecurityAssessment securityAssessment = new SecurityAssessment();
    securityAssessment.setName("Security assessment for tests");
    securityAssessment.setExternalId("x-security-assessment--%s".formatted(UUID.randomUUID()));
    securityAssessment.setThreatContextRef("report--%s".formatted(UUID.randomUUID()));
    securityAssessment.setScheduling(ScheduleFrequency.DAILY);
    securityAssessment.setContent(
        "{\"type\": \"x-security-assessment\", \"id\": \"%s\"}"
            .formatted(securityAssessment.getExternalId()));
    return securityAssessment;
  }

  public static SecurityAssessment createSecurityAssessmentWithAttackPatterns(
      List<AttackPattern> attackPatterns) {
    SecurityAssessment securityAssessment = createDefaultSecurityAssessment();
    securityAssessment.setAttackPatternRefs(
        attackPatterns.stream()
            .map(
                ap ->
                    new StixRefToExternalRef(
                        "attack-pattern--%s".formatted(ap.getId()), ap.getExternalId()))
            .toList());
    return securityAssessment;
  }
}
