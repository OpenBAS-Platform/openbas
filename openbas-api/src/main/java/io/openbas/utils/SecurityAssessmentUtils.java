package io.openbas.utils;

import io.openbas.database.model.StixRefToExternalRef;
import io.openbas.stix.objects.Bundle;
import io.openbas.stix.objects.ObjectBase;
import java.util.ArrayList;
import java.util.List;
import org.apache.coyote.BadRequestException;

public class SecurityAssessmentUtils {

  public static final String STIX_X_MITRE_ID = "x_mitre_id";
  public static final String STIX_ID = "id";
  public static final String STIX_TYPE = "type";
  public static final String STIX_ATTACK_PATTERN_TYPE = "attack-pattern";
  public static final String X_SECURITY_ASSESSMENT = "x-security-assessment";

  public static ObjectBase extractAndValidateAssessment(Bundle bundle) throws BadRequestException {
    List<ObjectBase> assessments = bundle.findByType(X_SECURITY_ASSESSMENT);
    if (assessments.size() != 1) {
      throw new BadRequestException("STIX bundle must contain exactly one x-security-assessment");
    }
    return assessments.get(0);
  }

  public static List<StixRefToExternalRef> extractObjectReferences(List<ObjectBase> objects) {
    List<StixRefToExternalRef> stixToMitre = new ArrayList<>();
    for (ObjectBase obj : objects) {
      String stixId = (String) obj.getProperty(STIX_ID).getValue();
      String type = (String) obj.getProperty(STIX_TYPE).getValue();

      if (STIX_ATTACK_PATTERN_TYPE.equals(type)) {
        String mitreId = (String) obj.getProperty(STIX_X_MITRE_ID).getValue();
        if (mitreId != null) {
          StixRefToExternalRef stixRef = new StixRefToExternalRef(stixId, mitreId);
          stixToMitre.add(stixRef);
        }
      }
    }
    return stixToMitre;
  }
}
