package io.openex.rest.exercise;

import io.openex.database.model.*;
import io.openex.database.repository.*;
import io.openex.database.specification.*;
import io.openex.rest.exercise.form.*;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.inject.form.InjectInput;
import io.openex.service.DryrunService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;

import static io.openex.config.AppConfig.currentUser;
import static io.openex.database.model.User.*;
import static io.openex.helper.DatabaseHelper.updateRelationResolver;

@RestController
@RolesAllowed(ROLE_USER)
public class ExerciseApi<T> extends RestBehavior {
    // region repositories
    private DocumentRepository documentRepository;
    private ExerciseRepository exerciseRepository;
    private ObjectiveRepository objectiveRepository;
    private AudienceRepository audienceRepository;
    private InjectRepository<T> injectRepository;
    private ExerciseLogRepository exerciseLogRepository;
    private DryRunRepository dryRunRepository;
    private ComcheckRepository comcheckRepository;
    private GroupRepository groupRepository;
    // endregion

    // region services
    private DryrunService<T> dryrunService;
    // endregion

    // region setters
    @Autowired
    public void setDocumentRepository(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @Autowired
    public void setDryrunService(DryrunService<T> dryrunService) {
        this.dryrunService = dryrunService;
    }

    @Autowired
    public void setGroupRepository(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    @Autowired
    public void setComcheckRepository(ComcheckRepository comcheckRepository) {
        this.comcheckRepository = comcheckRepository;
    }

    @Autowired
    public void setDryRunRepository(DryRunRepository dryRunRepository) {
        this.dryRunRepository = dryRunRepository;
    }

    @Autowired
    public void setExerciseLogRepository(ExerciseLogRepository exerciseLogRepository) {
        this.exerciseLogRepository = exerciseLogRepository;
    }

    @Autowired
    public void setInjectRepository(InjectRepository<T> injectRepository) {
        this.injectRepository = injectRepository;
    }

    @Autowired
    public void setAudienceRepository(AudienceRepository audienceRepository) {
        this.audienceRepository = audienceRepository;
    }

    @Autowired
    public void setObjectiveRepository(ObjectiveRepository objectiveRepository) {
        this.objectiveRepository = objectiveRepository;
    }

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }
    // endregion

    // region objectives
    @GetMapping("/api/exercises/{exerciseId}/objectives")
    public Iterable<Objective> getMainObjectives(@PathVariable String exerciseId) {
        return objectiveRepository.findAll(ObjectiveSpecification.fromExercise(exerciseId));
    }

    @PostMapping("/api/exercises/{exerciseId}/objectives")
    public Objective createObjective(@PathVariable String exerciseId, @Valid @RequestBody ObjectiveCreateInput createObjectiveInput) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        Objective objective = new Objective();
        objective.setUpdateAttributes(createObjectiveInput);
        objective.setExercise(exercise);
        return objectiveRepository.save(objective);
    }
    // endregion

    // region audiences
    @GetMapping("/api/exercises/{exerciseId}/audiences")
    public Iterable<Audience> getAudiences(@PathVariable String exerciseId) {
        return audienceRepository.findAll(AudienceSpecification.fromExercise(exerciseId));
    }
    // endregion

    // region injects
    @GetMapping("/api/exercises/{exerciseId}/injects")
    public Iterable<Inject<T>> exerciseInjects(@PathVariable String exerciseId) {
        return injectRepository.findAll(InjectSpecification.fromExercise(exerciseId));
    }

    @PostMapping("/api/exercises/{exerciseId}/injects")
    public Inject<T> createInject(@PathVariable String exerciseId, @Valid @RequestBody InjectInput<T> createInjectInput) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        Inject<T> inject = createInjectInput.toInject();
        inject.setUser(currentUser());
        inject.setExercise(exercise);
        Instant from = exercise.getStart().toInstant();
        Instant to = createInjectInput.getDate().toInstant();
        long duration = Duration.between(from, to).getSeconds();
        inject.setDependsDuration(duration);
        inject.setAudiences(fromIterable(audienceRepository.findAllById(createInjectInput.getAudiences())));
        return injectRepository.save(inject);
    }

    @DeleteMapping("/api/exercises/{exerciseId}/events/{eventId}/incidents/{incidentId}/injects/{injectId}")
    public void deleteInject(@PathVariable String injectId) {
        injectRepository.deleteById(injectId);
    }
    // endregion

    // region logs
    @GetMapping("/api/exercises/{exercise}/logs")
    public Iterable<ExerciseLog> logs(@PathVariable String exercise) {
        return exerciseLogRepository.findAll(ExerciseLogSpecification.fromExercise(exercise));
    }

    @PostMapping("/api/exercises/{exerciseId}/logs")
    public ExerciseLog createLog(@PathVariable String exerciseId, @Valid @RequestBody LogCreateInput createLogInput) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        ExerciseLog log = new ExerciseLog();
        log.setUpdateAttributes(createLogInput);
        log.setExercise(exercise);
        log.setUser(currentUser());
        log.setDate(new Date());
        return exerciseLogRepository.save(log);
    }
    // endregion

    // region dryruns
    @GetMapping("/api/exercises/{exerciseId}/dryruns")
    public Iterable<Dryrun> dryruns(@PathVariable String exerciseId) {
        return dryRunRepository.findAll(DryRunSpecification.fromExercise(exerciseId));
    }

    @PostMapping("/api/exercises/{exerciseId}/dryruns")
    public Dryrun createDryrun(@PathVariable String exerciseId, @Valid @RequestBody DryRunCreateInput createRunInput) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        return dryrunService.provisionDryrun(exercise, createRunInput.getSpeed());
    }

    @GetMapping("/api/exercises/{exerciseId}/dryruns/{dryrunId}")
    public Dryrun dryrun(@PathVariable String exerciseId, @PathVariable String dryrunId) {
        Specification<Dryrun> filters = DryRunSpecification
                .fromExercise(exerciseId).and(DryRunSpecification.id(dryrunId));
        return dryRunRepository.findOne(filters).orElseThrow();
    }

    @DeleteMapping("/api/exercises/{exerciseId}/dryruns/{dryrunId}")
    public void deleteDryrun(@PathVariable String exerciseId, @PathVariable String dryrunId) {
        dryRunRepository.deleteById(dryrunId);
    }

    @GetMapping("/api/exercises/{exerciseId}/dryruns/{dryrunId}/dryinjects")
    public List<DryInject<?>> dryrunInjects(@PathVariable String exerciseId, @PathVariable String dryrunId) {
        return dryrun(exerciseId, dryrunId).getInjects();
    }
    // endregion

    // region comchecks
    @GetMapping("/api/exercises/{exercise}/comchecks")
    public Iterable<Comcheck> comchecks(@PathVariable String exercise) {
        return comcheckRepository.findAll(ComcheckSpecification.fromExercise(exercise));
    }

    @GetMapping("/api/exercises/{exercise}/comchecks/{comcheck}")
    public Comcheck comcheck(@PathVariable String exercise, @PathVariable String comcheck) {
        Specification<Comcheck> filters = ComcheckSpecification
                .fromExercise(exercise).and(ComcheckSpecification.id(comcheck));
        return comcheckRepository.findOne(filters).orElseThrow();
    }

    @GetMapping("/api/exercises/{exercise}/comchecks/{comcheck}/statuses")
    public List<ComcheckStatus> comcheckStatuses(@PathVariable String exercise, @PathVariable String comcheck) {
        return comcheck(exercise, comcheck).getComcheckStatus();
    }
    // endregion

    // region exercises
    @RolesAllowed(ROLE_PLANIFICATEUR)
    @PostMapping("/api/exercises")
    public Exercise createExercise(@Valid @RequestBody ExerciseCreateInput input) {
        Exercise exercise = new Exercise();
        exercise.setUpdateAttributes(input);
        exercise.setOwner(currentUser());
        return exerciseRepository.save(exercise);
    }

    @SuppressWarnings({"ELValidationInJSP", "SpringElInspection"})
    @PutMapping("/api/exercises/{exerciseId}/information")
    @PostAuthorize("hasRole('" + ROLE_PLANIFICATEUR + "') OR isExercisePlanner(#exerciseId)")
    public Exercise updateExerciseInformation(@PathVariable String exerciseId, @Valid @RequestBody ExerciseUpdateInformationInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        exercise.setUpdateAttributes(input);
        exercise.setAnimationGroup(updateRelationResolver(input.getAnimationGroup(), exercise.getAnimationGroup(), groupRepository));
        return exerciseRepository.save(exercise);
    }

    @SuppressWarnings({"ELValidationInJSP", "SpringElInspection"})
    @PutMapping("/api/exercises/{exerciseId}/image")
    @PostAuthorize("hasRole('" + ROLE_PLANIFICATEUR + "') OR isExercisePlanner(#exerciseId)")
    public Exercise updateExerciseImage(@PathVariable String exerciseId, @Valid @RequestBody ExerciseUpdateImageInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        exercise.setImage(documentRepository.findById(input.getImageId()).orElse(null));
        return exerciseRepository.save(exercise);
    }

    @SuppressWarnings({"ELValidationInJSP", "SpringElInspection"})
    @DeleteMapping("/api/exercises/{exerciseId}")
    @PostAuthorize("hasRole('" + ROLE_PLANIFICATEUR + "') OR isExercisePlanner(#exerciseId)")
    public void deleteExercise(@PathVariable String exerciseId) {
        exerciseRepository.deleteById(exerciseId);
    }

    @SuppressWarnings({"ELValidationInJSP", "SpringElInspection"})
    @GetMapping("/api/exercises/{exerciseId}")
    @PostAuthorize("hasRole('" + ROLE_ADMIN + "') OR isExerciseObserver(#exerciseId)")
    public Exercise exercise(@PathVariable String exerciseId) {
        return exerciseRepository.findById(exerciseId).orElseThrow();
    }

    @GetMapping("/api/exercises")
    // @PostAuthorize - Exercises are filtered by query
    public Iterable<Exercise> exercises() {
        return currentUser().isAdmin() ?
                exerciseRepository.findAll() :
                exerciseRepository.findAllGranted(currentUser().getId());
    }
    // endregion
}
