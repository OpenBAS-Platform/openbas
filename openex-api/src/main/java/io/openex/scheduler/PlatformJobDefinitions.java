package io.openex.scheduler;

import io.openex.scheduler.jobs.ComchecksExecutionJob;
import io.openex.scheduler.jobs.InjectsExecutionJob;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import static org.quartz.JobKey.jobKey;

@Component
public class PlatformJobDefinitions {

    @Bean
    public JobDetail getInjectsExecution() {
        return JobBuilder.newJob(InjectsExecutionJob.class)
                .storeDurably().withIdentity(jobKey("InjectsExecutionJob")).build();
    }

    @Bean
    public JobDetail getComchecksExecution() {
        return JobBuilder.newJob(ComchecksExecutionJob.class)
                .storeDurably().withIdentity(jobKey("ComchecksExecutionJob")).build();
    }
}
