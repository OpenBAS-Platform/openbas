package io.openex.scheduler.jobs;

import io.openex.config.OpenExConfig;
import io.openex.database.model.Comcheck;
import io.openex.database.model.ComcheckStatus;
import io.openex.database.model.Exercise;
import io.openex.database.repository.ComcheckRepository;
import io.openex.database.repository.ComcheckStatusRepository;
import io.openex.injects.email.EmailExecutor;
import io.openex.injects.email.model.EmailContent;
import io.openex.injects.email.model.EmailInject;
import io.openex.execution.*;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static io.openex.database.model.Comcheck.COMCHECK_STATUS.EXPIRED;
import static io.openex.database.specification.ComcheckStatusSpecification.thatNeedExecution;
import static java.time.Instant.now;
import static java.util.stream.Collectors.groupingBy;

@Component
@DisallowConcurrentExecution
public class ComchecksExecutionJob implements Job {

    public static final String COMCHECK_LINK = "comcheck";
    private final static String RC = "<br /><br />";
    private OpenExConfig openExConfig;
    private ApplicationContext context;
    private ComcheckRepository comcheckRepository;
    private ComcheckStatusRepository comcheckStatusRepository;

    @Autowired
    public void setComcheckRepository(ComcheckRepository comcheckRepository) {
        this.comcheckRepository = comcheckRepository;
    }

    @Autowired
    public void setOpenExConfig(OpenExConfig openExConfig) {
        this.openExConfig = openExConfig;
    }

    @Autowired
    public void setContext(ApplicationContext context) {
        this.context = context;
    }

    @Autowired
    public void setComcheckStatusRepository(ComcheckStatusRepository comcheckStatusRepository) {
        this.comcheckStatusRepository = comcheckStatusRepository;
    }

    private EmailInject buildComcheckEmail(Comcheck comCheck) {
        EmailContent content = new EmailContent();
        String link = "<a href='${" + COMCHECK_LINK + "}'>${" + COMCHECK_LINK + "}</a>";
        content.setSubject("[" + comCheck.getExercise().getName() + "] " + comCheck.getSubject());
        content.setBody(comCheck.getMessage() + RC + link + RC + comCheck.getSignature());
        EmailInject emailInject = new EmailInject();
        emailInject.setContent(content);
        return emailInject;
    }

    @Override
    public void execute(JobExecutionContext jobExecutionContext) {
        Instant now = now();
        // 01. Manage expired comchecks.
        List<Comcheck> toExpired = comcheckRepository.thatMustBeExpired(now);
        comcheckRepository.saveAll(toExpired.stream()
                .peek(comcheck -> comcheck.setState(EXPIRED)).toList());
        // 02. Send all required statuses
        List<ComcheckStatus> allStatuses = comcheckStatusRepository.findAll(thatNeedExecution());
        Map<Comcheck, List<ComcheckStatus>> byComchecks = allStatuses.stream().collect(groupingBy(ComcheckStatus::getComcheck));
        byComchecks.entrySet().stream().parallel().forEach(entry -> {
            Comcheck comCheck = entry.getKey();
            // Send the email to users
            Exercise exercise = comCheck.getExercise();
            List<ComcheckStatus> comcheckStatuses = entry.getValue();
            List<ExecutionContext> userInjectContexts = comcheckStatuses.stream().map(comcheckStatus -> {
                String comCheckLink = openExConfig.getBaseUrl() + "/comcheck/" + comcheckStatus.getId();
                ExecutionContext injectContext = new ExecutionContext(comcheckStatus.getUser(), exercise, "Comcheck");
                injectContext.put(COMCHECK_LINK, comCheckLink); // Add specific inject variable for comcheck link
                return injectContext;
            }).toList();
            EmailInject emailInject = buildComcheckEmail(comCheck);
            ExecutableInject<EmailContent> injection = new ExecutableInject<>(emailInject, userInjectContexts);
            EmailExecutor emailExecutor = context.getBean(EmailExecutor.class);
            Execution execution = emailExecutor.execute(injection);
            // Save the status sent date
            List<String> usersSuccessfullyNotified = execution.getTraces().stream()
                    .filter(executionTrace -> executionTrace.getStatus().equals(ExecutionStatus.SUCCESS))
                    .map(ExecutionTrace::getIdentifier).toList();
            List<ComcheckStatus> statusToUpdate = comcheckStatuses.stream()
                    .filter(comcheckStatus -> usersSuccessfullyNotified.contains(comcheckStatus.getUser().getId()))
                    .toList();
            if (statusToUpdate.size() > 0) {
                comcheckStatusRepository.saveAll(statusToUpdate.stream()
                        .peek(comcheckStatus -> comcheckStatus.setLastSent(now))
                        .toList());
            }
        });
    }
}
