package io.openbas.scheduler.jobs;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.SecurityCoverageSendJob;
import io.openbas.service.SecurityCoverageSendJobService;
import io.openbas.service.SecurityCoverageService;
import io.openbas.stix.objects.Bundle;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@DisallowConcurrentExecution
public class SecurityCoverageJob implements Job {
  private final SecurityCoverageSendJobService securityCoverageSendJobService;
  private final SecurityCoverageService securityCoverageService;
  private final ObjectMapper mapper;

  @Override
  @Transactional
  public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
    List<SecurityCoverageSendJob> jobs =
        securityCoverageSendJobService.getPendingSecurityCoverageSendJobs();
    for (SecurityCoverageSendJob securityCoverageSendJob : jobs) {
      Bundle bundle =
          securityCoverageService.createBundleFromSendJobs(List.of(securityCoverageSendJob));
      JsonNode n = bundle.toStix(mapper);
      // send bundle
    }
    securityCoverageSendJobService.consumeJobs(jobs);
  }
}
