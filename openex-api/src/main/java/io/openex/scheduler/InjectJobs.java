package io.openex.scheduler;

import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class InjectJobs {

    @Bean
    public JobDetail injectsJobDetail() {
        return JobBuilder.newJob(InjectsHandlingJob.class)
                .storeDurably().withIdentity("injectsJob").build();
    }

}
