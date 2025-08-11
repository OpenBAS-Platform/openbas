package io.openbas.service;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.SecurityAssessment;
import io.openbas.database.model.SecurityCoverageSendJob;
import io.openbas.stix.objects.Bundle;
import io.openbas.stix.objects.ObjectBase;
import io.openbas.stix.types.Identifier;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SecurityCoverageService {
  private final SimulationStixService simulationStixService;

  public Bundle createBundleFromSendJobs(List<SecurityCoverageSendJob> securityCoverageSendJobs) {
    List<ObjectBase> objects = new ArrayList<>();
    for (SecurityCoverageSendJob securityCoverageSendJob : securityCoverageSendJobs) {
      SecurityAssessment sa = securityCoverageSendJob.getSimulation().getSecurityAssessment();
      if (sa == null) {
        continue;
      }

      Exercise ex = securityCoverageSendJob.getSimulation();
      objects.addAll(simulationStixService.getCoverageForSimulation(ex));
    }

    return new Bundle(new Identifier("bundle--" + UUID.randomUUID()), objects);
  }
}
