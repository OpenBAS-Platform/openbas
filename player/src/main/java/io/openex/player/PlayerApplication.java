package io.openex.player;

import io.openex.player.scheduler.InjectsHandlingJob;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Trigger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import static org.quartz.CronScheduleBuilder.cronSchedule;
import static org.quartz.TriggerBuilder.newTrigger;

@SpringBootApplication
public class PlayerApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlayerApplication.class, args);
    }

    @Bean
    public JobDetail injectsJobDetail() {
        return JobBuilder.newJob(InjectsHandlingJob.class).storeDurably().withIdentity("injectsJob").build();
    }

    @Bean
    public Trigger injectsJobTrigger() {
        return newTrigger()
                .forJob(injectsJobDetail())
                .withIdentity("injectsTrigger")
                .withSchedule(cronSchedule("0/30 * * * * ?"))
                .build();

    }
}
