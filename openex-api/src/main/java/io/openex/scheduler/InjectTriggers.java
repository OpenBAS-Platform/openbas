package io.openex.scheduler;

import org.quartz.Trigger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import static org.quartz.CronScheduleBuilder.cronSchedule;
import static org.quartz.TriggerBuilder.newTrigger;

@Component
public class InjectTriggers {

    private InjectJobs injectJobs;

    @Autowired
    public void setInjectJobs(InjectJobs injectJobs) {
        this.injectJobs = injectJobs;
    }

    @Bean
    public Trigger injectsJobTrigger() {
        return newTrigger()
                .forJob(injectJobs.injectsJobDetail())
                .withIdentity("injectsTrigger")
                .withSchedule(cronSchedule("0 0/1 * * * ?"))
                .build();

    }
}
