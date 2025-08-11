package io.openbas.service;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.SecurityCoverageSendJob;
import io.openbas.database.repository.SecurityCoverageSendJobRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SecurityCoverageSendJobService {
  private final SecurityCoverageSendJobRepository securityCoverageSendJobRepository;

  public void createOrUpdateJobsForSimulation(Set<Exercise> exercises) {
    List<SecurityCoverageSendJob> jobs = new ArrayList<>();
    for (Exercise exercise : exercises) {
      Optional<SecurityCoverageSendJob> scsj =
          securityCoverageSendJobRepository.findBySimulation(exercise);
      if (scsj.isPresent()) {
        scsj.get().setUpdatedAt(Instant.now());
        jobs.add(scsj.get());
      } else {
        SecurityCoverageSendJob newJob = new SecurityCoverageSendJob();
        newJob.setSimulation(exercise);
        newJob.setUpdatedAt(Instant.now());
        jobs.add(newJob);
      }
    }
    if (!jobs.isEmpty()) {
      securityCoverageSendJobRepository.saveAll(jobs);
    }
  }

  public List<SecurityCoverageSendJob> getPendingSecurityCoverageSendJobs() {
    return securityCoverageSendJobRepository.findByStatusAndUpdatedAtBefore(
        "PENDING", Instant.now().minus(1, ChronoUnit.MINUTES));
  }
}
