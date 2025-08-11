package io.openbas.scheduler.jobs;

import io.openbas.database.model.SecurityCoverageSendJob;
import io.openbas.database.repository.SecurityCoverageSendJobRepository;
import io.openbas.service.SecurityCoverageSendJobService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SecurityCoverageJob implements Job {
  private final SecurityCoverageSendJobService securityCoverageSendJobService;

  @Override
  @Transactional // ensure a transaction context to help lock rows
  public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
    List<SecurityCoverageSendJob> jobs = securityCoverageSendJobService.getPendingSecurityCoverageSendJobs();


  }
}
