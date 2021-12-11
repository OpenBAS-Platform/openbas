package io.openex.rest.exercise;

import io.openex.database.model.*;
import io.openex.database.repository.*;
import io.openex.database.specification.*;
import io.openex.rest.exercise.form.*;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.inject.form.InjectCreateInput;
import io.openex.service.DryrunService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;

import static io.openex.database.model.User.ROLE_PLANIFICATEUR;
import static io.openex.database.model.User.ROLE_USER;
import static io.openex.helper.DatabaseHelper.updateRelationResolver;

@RestController
@RolesAllowed(ROLE_USER)
public class ExerciseApi extends RestBehavior {
    // Repositories
    private FileRepository fileRepository;
    private ExerciseRepository exerciseRepository;
    private ObjectiveRepository objectiveRepository;
    private SubObjectiveRepository subObjectiveRepository;
    private AudienceRepository audienceRepository;
    private SubAudienceRepository subAudienceRepository;
    private EventRepository eventRepository;
    private IncidentRepository incidentRepository;
    private InjectRepository injectRepository;
    private ExerciseLogRepository exerciseLogRepository;
    private DryRunRepository dryRunRepository;
    private ComcheckRepository comcheckRepository;
    private GroupRepository groupRepository;
    private IncidentTypeRepository incidentTypeRepository;
    // Services
    private DryrunService dryrunService;

    // region setters
    @Autowired
    public void setDryrunService(DryrunService dryrunService) {
        this.dryrunService = dryrunService;
    }

    @Autowired
    public void setIncidentTypeRepository(IncidentTypeRepository incidentTypeRepository) {
        this.incidentTypeRepository = incidentTypeRepository;
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
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
    }

    @Autowired
    public void setIncidentRepository(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    @Autowired
    public void setEventRepository(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Autowired
    public void setSubAudienceRepository(SubAudienceRepository subAudienceRepository) {
        this.subAudienceRepository = subAudienceRepository;
    }

    @Autowired
    public void setAudienceRepository(AudienceRepository audienceRepository) {
        this.audienceRepository = audienceRepository;
    }

    @Autowired
    public void setSubObjectiveRepository(SubObjectiveRepository subObjectiveRepository) {
        this.subObjectiveRepository = subObjectiveRepository;
    }

    @Autowired
    public void setObjectiveRepository(ObjectiveRepository objectiveRepository) {
        this.objectiveRepository = objectiveRepository;
    }

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Autowired
    public void setFileRepository(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }
    // endregion

    // region objectives
    @GetMapping("/api/exercises/{exerciseId}/objectives")
    public Iterable<Objective> getMainObjectives(@PathVariable String exerciseId) {
        return objectiveRepository.findAll(ObjectiveSpecification.fromExercise(exerciseId)
                .and(ObjectiveSpecification.withExercise()));
    }

    @PostMapping("/api/exercises/{exerciseId}/objectives")
    public Objective createObjective(@PathVariable String exerciseId, @Valid @RequestBody ObjectiveCreateInput createObjectiveInput) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        Objective objective = new Objective();
        objective.setUpdateAttributes(createObjectiveInput);
        objective.setExercise(exercise);
        return objectiveRepository.save(objective);
    }

    @GetMapping("/api/exercises/{exerciseId}/subobjectives")
    public Iterable<SubObjective> getSubObjectives(@PathVariable String exerciseId) {
        return subObjectiveRepository.findAll(SubObjectiveSpecification.fromExercise(exerciseId));
    }
    // endregion

    // region audiences
    @GetMapping("/api/exercises/{exerciseId}/audiences")
    public Iterable<Audience> getAudiences(@PathVariable String exerciseId) {
        return audienceRepository.findAll(AudienceSpecification.fromExercise(exerciseId));
    }

    @GetMapping("/api/exercises/{exerciseId}/subaudiences")
    public Iterable<SubAudience> getSubAudiences(@PathVariable String exerciseId) {
        return subAudienceRepository.findAll(SubAudienceSpecification.fromExercise(exerciseId));
    }
    // endregion

    // region events
    @GetMapping("/api/exercises/{exerciseId}/events")
    public Iterable<Event> events(@PathVariable String exerciseId) {
        return eventRepository.findAll(EventSpecification.fromExercise(exerciseId));
    }

    @PostMapping("/api/exercises/{exerciseId}/events")
    public Event createObjective(@PathVariable String exerciseId, @Valid @RequestBody EventCreateInput createEventInput) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        Event event = new Event();
        event.setUpdateAttributes(createEventInput);
        event.setExercise(exercise);
        return eventRepository.save(event);
    }
    // endregion

    // region incidents
    @GetMapping("/api/exercises/{exerciseId}/incidents")
    public Iterable<Incident> incidents(@PathVariable String exerciseId) {
        return incidentRepository.findAll(IncidentSpecification.fromExercise(exerciseId));
    }

    @PostMapping("/api/exercises/{exerciseId}/events/{eventId}/incidents")
    public Incident createIncident(@PathVariable String exerciseId, @PathVariable String eventId,
                                   @Valid @RequestBody IncidentCreateInput createIncidentInput) {
        Event exerciseEvent = eventRepository.findById(eventId).orElseThrow();
        Incident incident = new Incident();
        incident.setUpdateAttributes(createIncidentInput);
        incident.setType(incidentTypeRepository.findById(createIncidentInput.getType()).orElse(null));
        incident.setEvent(exerciseEvent);
        return incidentRepository.save(incident);
    }
    // endregion

    // region injects
    @GetMapping("/api/exercises/{exerciseId}/injects")
    public Iterable<Inject<?>> exerciseInjects(@PathVariable String exerciseId) {
        return injectRepository.findAll(InjectSpecification.fromExercise(exerciseId));
    }

    @GetMapping("/api/exercises/{exerciseId}/events/{eventId}/injects")
    public Iterable<Inject<?>> eventInjects(@PathVariable String exerciseId, @PathVariable String eventId) {
        Specification<Inject<?>> filters = InjectSpecification.fromEvent(eventId)
                .and(InjectSpecification.fromExercise(exerciseId));
        return injectRepository.findAll(filters);
    }

    @PostMapping("/api/exercises/{exerciseId}/events/{eventId}/incidents/{incidentId}/injects")
    public Inject createInject(@PathVariable String incidentId, @Valid @RequestBody InjectCreateInput<?> createInjectInput) {
        Incident incident = incidentRepository.findById(incidentId).orElseThrow();
        Inject<?> inject = createInjectInput.toInject();
        inject.setUser(currentUser());
        inject.setIncident(incident);
        Instant from = incident.getEvent().getExercise().getStart().toInstant();
        Instant to = createInjectInput.getDate().toInstant();
        long duration = Duration.between(from, to).getSeconds();
        inject.setDependsDuration(duration);
        List<Audience> audiences = fromIterable(audienceRepository.findAllById(createInjectInput.getAudiences()));
        inject.setAudiences(audiences);
        return injectRepository.save(inject);
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
    public Exercise createExercise(@Valid @RequestBody ExerciseCreateInput exerciseInput) {
        Exercise exercise = new Exercise();
        exercise.setUpdateAttributes(exerciseInput);
        exercise.setOwner(currentUser());
        exercise.setFile(fileRepository.findByName("Exercise default").orElse(null));
        return exerciseRepository.save(exercise);
    }

    @RolesAllowed(ROLE_PLANIFICATEUR)
    @PutMapping("/api/exercises/{exerciseId}")
    public Exercise updateExercise(@PathVariable String exerciseId, @Valid @RequestBody ExerciseUpdateInput exerciseInput) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        exercise.setUpdateAttributes(exerciseInput);
        exercise.setAnimationGroup(updateRelationResolver(exerciseInput.getAnimationGroup(), exercise.getAnimationGroup(), groupRepository));
        return exerciseRepository.save(exercise);
    }

    @DeleteMapping("/api/exercises/{exerciseId}")
    public void deleteExercise(@PathVariable String exerciseId) {
        exerciseRepository.deleteById(exerciseId);
    }

    @GetMapping("/api/exercises")
    public Iterable<Exercise> exercises() {
        return currentUser().isAdmin() ?
                exerciseRepository.findAll() :
                exerciseRepository.findAllGranted(currentUser().getId());
    }

    @GetMapping("/api/exercises/{exercise}")
    public Exercise exercise(@PathVariable String exercise) {
        return exerciseRepository.findById(exercise).orElseThrow();
    }
    // endregion
}
