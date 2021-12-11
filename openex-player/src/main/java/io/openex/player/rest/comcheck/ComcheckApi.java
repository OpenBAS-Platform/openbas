package io.openex.player.rest.comcheck;

import io.openex.player.helper.InjectHelper;
import io.openex.player.injects.email.EmailExecutor;
import io.openex.player.injects.email.model.EmailContent;
import io.openex.player.injects.email.model.EmailInject;
import io.openex.player.model.database.Audience;
import io.openex.player.model.database.Comcheck;
import io.openex.player.model.database.Exercise;
import io.openex.player.model.execution.ExecutableInject;
import io.openex.player.model.execution.Execution;
import io.openex.player.repository.AudienceRepository;
import io.openex.player.repository.ComcheckRepository;
import io.openex.player.repository.ExerciseRepository;
import io.openex.player.rest.comcheck.form.ComcheckInput;
import io.openex.player.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import java.util.Date;

import static io.openex.player.model.database.User.ROLE_PLANIFICATEUR;
import static io.openex.player.model.execution.ExecutableInject.prodRun;
import static java.util.List.of;

@RestController
public class ComcheckApi extends RestBehavior {

    private final static String RC = "<br /><br />";
    private ApplicationContext context;
    private ComcheckRepository comcheckRepository;
    private AudienceRepository audienceRepository;
    private ExerciseRepository exerciseRepository;
    private InjectHelper injectHelper;

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

    @Autowired
    public void setInjectHelper(InjectHelper injectHelper) {
        this.injectHelper = injectHelper;
    }

    @RolesAllowed(ROLE_PLANIFICATEUR)
    @PostMapping("/api/comcheck")
    public Execution communicationCheck(@Valid @RequestBody ComcheckInput comCheck) {
        // 01. Create the comcheck and get the ID
        Comcheck check = new Comcheck();
        check.setStart(new Date());
        check.setEnd(comCheck.getEnd());
        Exercise exercise = exerciseRepository.findById(comCheck.getExerciseId()).get();
        check.setExercise(exercise);
        Audience audience = audienceRepository.findById(comCheck.getTargetAudienceId()).get();
        check.setAudience(audience);
        io.openex.player.model.database.Comcheck save = comcheckRepository.save(check);
        // 02. Send email to appropriate audience
        String comCheckLink = "/comcheck/" + save.getId();
        EmailExecutor emailExecutor = context.getBean(EmailExecutor.class);
        EmailContent content = new EmailContent();
        content.setSubject("[" + exercise.getName() + "] " + comCheck.getSubject());
        content.setBody(comCheck.getMessage() + RC + comCheckLink + RC + comCheck.getSignature());
        EmailInject emailInject = new EmailInject();
        emailInject.setContent(content);
        emailInject.setAudiences(of(audience));
        ExecutableInject<EmailContent> injection = //
                prodRun(emailInject, injectHelper.buildUsersFromInject(emailInject));
        return emailExecutor.execute(injection);
    }
}
