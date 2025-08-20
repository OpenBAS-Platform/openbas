package io.openbas.service;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.SecurityCoverageSendJob;
import io.openbas.database.repository.SecurityCoverageSendJobRepository;
import jakarta.persistence.EntityManager;
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
  private final EntityManager entityManager;

  public void createOrUpdateJobsForSimulation(Set<Exercise> exercises) {
    List<SecurityCoverageSendJob> jobs = new ArrayList<>();
    for (Exercise exercise : exercises) {
      Optional<SecurityCoverageSendJob> scsj =
          securityCoverageSendJobRepository.findBySimulation(exercise);
      if (scsj.isPresent()) {
        scsj.get().setStatus("PENDING");
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
    return securityCoverageSendJobRepository.findByStatusAndUpdatedAtBeforeNoLock(
        "PENDING", Instant.now().minus(1, ChronoUnit.MINUTES));
  }

  public void consumeJobs(List<SecurityCoverageSendJob> jobs) {
    /* force hibernate to forget cache and refetch new data */
    entityManager.flush();
    entityManager.clear();
    /* end clear */
    List<SecurityCoverageSendJob> refetchedJobs =
        securityCoverageSendJobRepository.findAllByIdForUpdate(
            jobs.stream().map(SecurityCoverageSendJob::getId).toList());

    for (SecurityCoverageSendJob job : jobs) {
      List<SecurityCoverageSendJob> jobsToUpdate = new ArrayList<>();
      Optional<SecurityCoverageSendJob> refetched =
          refetchedJobs.stream().filter(j -> job.getId().equals(j.getId())).findAny();
      if (refetched.isPresent()
          && job.getSimulation().equals(refetched.get().getSimulation())
          && job.getStatus().equals(refetched.get().getStatus())
          && job.getUpdatedAt().equals(refetched.get().getUpdatedAt())) {
        refetched.get().setStatus("SENT");
        jobsToUpdate.add(refetched.get());
      }
      securityCoverageSendJobRepository.saveAll(jobsToUpdate);
    }
  }
}
