package io.openbas.service;

import io.openbas.database.model.SecurityAssessment;
import io.openbas.database.model.SecurityCoverageSendJob;
import io.openbas.stix.objects.Bundle;
import io.openbas.stix.objects.ObjectBase;
import io.openbas.stix.types.Identifier;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class SecurityCoverageService {
  public Bundle createBundleFromSendJobs(List<SecurityCoverageSendJob> securityCoverageSendJobs) {
    List<ObjectBase> objects = new ArrayList<>();
    for (SecurityCoverageSendJob securityCoverageSendJob : securityCoverageSendJobs) {
      SecurityAssessment sa = securityCoverageSendJob.getSimulation().getSecurityAssessment();
      if (sa == null) {
        continue;
      }


    }
    return new Bundle(
            new Identifier("bundle--" + UUID.randomUUID()),
            objects
    );
  }
}
