package io.openex.player.rest.exercise;

import io.openex.player.model.database.*;
import io.openex.player.repository.*;
import io.openex.player.rest.exercise.form.*;
import io.openex.player.rest.helper.RestBehavior;
import io.openex.player.specification.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import java.util.Date;
import java.util.List;

import static io.openex.player.helper.DatabaseHelper.updateRelationResolver;
import static io.openex.player.model.database.User.ROLE_PLANIFICATEUR;
import static io.openex.player.model.database.User.ROLE_USER;

@RestController
@RolesAllowed(ROLE_USER)
public class ExerciseApi extends RestBehavior {
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

    // region setters
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
    @GetMapping("/api/exercises/{exercise}/dryruns")
    public Iterable<Dryrun> dryruns(@PathVariable String exercise) {
        return dryRunRepository.findAll(DryRunSpecification.fromExercise(exercise));
    }

    @GetMapping("/api/exercises/{exercise}/dryruns/{dryrun}")
    public Dryrun dryrun(@PathVariable String exercise, @PathVariable String dryrun) {
        Specification<Dryrun> filters = DryRunSpecification
                .fromExercise(exercise).and(DryRunSpecification.id(dryrun));
        return dryRunRepository.findOne(filters).orElseThrow();
    }

    @GetMapping("/api/exercises/{exercise}/dryruns/{dryrun}/dryinjects")
    public List<DryInject<?>> dryrunInjects(@PathVariable String exercise, @PathVariable String dryrun) {
        return dryrun(exercise, dryrun).getInjects();
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
}
