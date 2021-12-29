package io.openex.rest.comcheck;

import io.openex.config.OpenExConfig;
import io.openex.database.model.*;
import io.openex.database.repository.AudienceRepository;
import io.openex.database.repository.ComcheckRepository;
import io.openex.database.repository.ComcheckStatusRepository;
import io.openex.database.repository.ExerciseRepository;
import io.openex.injects.email.EmailExecutor;
import io.openex.injects.email.model.EmailContent;
import io.openex.injects.email.model.EmailInject;
import io.openex.model.ExecutableInject;
import io.openex.model.UserInjectContext;
import io.openex.rest.comcheck.form.ComcheckInput;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Date;
import java.util.List;

import static java.util.List.of;
import static java.util.stream.StreamSupport.stream;

@RestController
public class ComcheckApi extends RestBehavior {

    private final static String RC = "<br /><br />";
    private OpenExConfig openExConfig;
    private ApplicationContext context;
    private ComcheckRepository comcheckRepository;
    private AudienceRepository audienceRepository;
    private ExerciseRepository exerciseRepository;
    private ComcheckStatusRepository comcheckStatusRepository;

    @Autowired
    public void setComcheckStatusRepository(ComcheckStatusRepository comcheckStatusRepository) {
        this.comcheckStatusRepository = comcheckStatusRepository;
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
    public void setComcheckRepository(ComcheckRepository comcheckRepository) {
        this.comcheckRepository = comcheckRepository;
    }

    @Autowired
    public void setAudienceRepository(AudienceRepository audienceRepository) {
        this.audienceRepository = audienceRepository;
    }

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @GetMapping("/api/comcheck/{comcheckStatusId}")
    public ComcheckStatus checkValidation(@PathVariable String comcheckStatusId) {
        ComcheckStatus comcheckStatus = comcheckStatusRepository.findById(comcheckStatusId).orElseThrow();
        comcheckStatus.setState(true);
        return comcheckStatusRepository.save(comcheckStatus);
    }

    @PostMapping("/api/exercises/{exerciseId}/comchecks")
    public Comcheck communicationCheck(@PathVariable String exerciseId,
                                       @Valid @RequestBody ComcheckInput comCheck) {
        // 01. Create the comcheck and get the ID
        Comcheck check = new Comcheck();
        check.setStart(new Date());
        check.setEnd(comCheck.getEnd());
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        check.setExercise(exercise);
        Audience audience = audienceRepository.findById(comCheck.getAudienceId()).orElseThrow();
        check.setAudience(audience);
        Comcheck savedComcheck = comcheckRepository.save(check);
        // 02. Create a status for each user
        List<User> users = audience.getUsers();
        List<ComcheckStatus> comcheckStatuses = users.stream().map(u -> {
            ComcheckStatus comcheckStatus = new ComcheckStatus();
            comcheckStatus.setUser(u);
            comcheckStatus.setState(false);
            comcheckStatus.setComcheck(savedComcheck);
            comcheckStatus.setLastUpdate(new Date());
            return comcheckStatus;
        }).toList();
        Iterable<ComcheckStatus> savedStatus = comcheckStatusRepository.saveAll(comcheckStatuses);
        // 03. Send email to appropriate audience
        stream(savedStatus.spliterator(), true).forEach(comcheckStatus -> {
            String comCheckLink = openExConfig.getBaseUrl() + "/comcheck/" + comcheckStatus.getId();
            EmailContent content = new EmailContent();
            content.setSubject("[" + exercise.getName() + "] " + comCheck.getSubject());
            content.setBody(comCheck.getMessage() + RC + comCheckLink + RC + comCheck.getSignature());
            EmailInject emailInject = new EmailInject();
            emailInject.setContent(content);
            emailInject.setAudiences(of(audience));
            List<UserInjectContext> userInjectContexts = users.stream()
                    .map(user -> new UserInjectContext(exercise, user, audience.getName()))
                    .toList();
            ExecutableInject<EmailContent> injection = new ExecutableInject<>(emailInject, userInjectContexts);
            EmailExecutor emailExecutor = context.getBean(EmailExecutor.class);
            emailExecutor.execute(injection);
        });
        return check;
    }
}
