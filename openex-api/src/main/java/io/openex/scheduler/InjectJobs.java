package io.openex.scheduler;

import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobKey;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class InjectJobs {

    public static final JobKey INJECT_JOB_KEY = JobKey.jobKey("injectsJob");

    @Bean
    public JobDetail injectsJobDetail() {
        return JobBuilder.newJob(InjectsHandlingJob.class)
                .storeDurably().withIdentity(INJECT_JOB_KEY).build();
    }

}
