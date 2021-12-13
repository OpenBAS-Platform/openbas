package io.openex.rest.comcheck;

import io.openex.helper.InjectHelper;
import io.openex.injects.email.EmailExecutor;
import io.openex.injects.email.model.EmailContent;
import io.openex.injects.email.model.EmailInject;
import io.openex.database.model.Audience;
import io.openex.database.model.Comcheck;
import io.openex.database.model.Exercise;
import io.openex.model.ExecutableInject;
import io.openex.model.Execution;
import io.openex.database.repository.AudienceRepository;
import io.openex.database.repository.ComcheckRepository;
import io.openex.database.repository.ExerciseRepository;
import io.openex.model.UserInjectContext;
import io.openex.rest.comcheck.form.ComcheckInput;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import java.util.Date;
import java.util.List;

import static io.openex.database.model.User.ROLE_PLANIFICATEUR;
import static io.openex.model.ExecutableInject.prodRun;
import static java.util.List.of;

@RestController
public class ComcheckApi<T> extends RestBehavior {

    private final static String RC = "<br /><br />";
    private ApplicationContext context;
    private ComcheckRepository comcheckRepository;
    private AudienceRepository audienceRepository;
    private ExerciseRepository exerciseRepository;

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

    @RolesAllowed(ROLE_PLANIFICATEUR)
    @PostMapping("/api/comcheck")
    public Execution communicationCheck(@Valid @RequestBody ComcheckInput comCheck) {
        // 01. Create the comcheck and get the ID
        Comcheck check = new Comcheck();
        check.setStart(new Date());
        check.setEnd(comCheck.getEnd());
        Exercise exercise = exerciseRepository.findById(comCheck.getExerciseId()).orElseThrow();
        check.setExercise(exercise);
        Audience audience = audienceRepository.findById(comCheck.getTargetAudienceId()).orElseThrow();
        check.setAudience(audience);
        Comcheck save = comcheckRepository.save(check);
        // 02. Send email to appropriate audience
        String comCheckLink = "/comcheck/" + save.getId();
        EmailExecutor emailExecutor = context.getBean(EmailExecutor.class);
        EmailContent content = new EmailContent();
        content.setSubject("[" + exercise.getName() + "] " + comCheck.getSubject());
        content.setBody(comCheck.getMessage() + RC + comCheckLink + RC + comCheck.getSignature());
        EmailInject emailInject = new EmailInject();
        emailInject.setContent(content);
        emailInject.setAudiences(of(audience));
        List<UserInjectContext> userInjectContexts = audience.getUsers().stream()
                .map(user -> new UserInjectContext(exercise, user, audience.getName()))
                .toList();
        ExecutableInject<EmailContent> injection = prodRun(emailInject, userInjectContexts);
        return emailExecutor.execute(injection);
    }
}
