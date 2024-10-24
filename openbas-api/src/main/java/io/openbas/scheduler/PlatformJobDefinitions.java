package io.openbas.scheduler;

import static org.quartz.JobKey.jobKey;

import io.openbas.scheduler.jobs.ComchecksExecutionJob;
import io.openbas.scheduler.jobs.InjectsExecutionJob;
import io.openbas.scheduler.jobs.ScenarioExecutionJob;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class PlatformJobDefinitions {

  @Bean
  public JobDetail getInjectsExecution() {
    return JobBuilder.newJob(InjectsExecutionJob.class)
        .storeDurably()
        .withIdentity(jobKey("InjectsExecutionJob"))
        .build();
  }

  @Bean
  public JobDetail getComchecksExecution() {
    return JobBuilder.newJob(ComchecksExecutionJob.class)
        .storeDurably()
        .withIdentity(jobKey("ComchecksExecutionJob"))
        .build();
  }

  @Bean
  public JobDetail getScenarioExecution() {
    return JobBuilder.newJob(ScenarioExecutionJob.class)
        .storeDurably()
        .withIdentity(jobKey("ScenarioExecutionJob"))
        .build();
  }
}
