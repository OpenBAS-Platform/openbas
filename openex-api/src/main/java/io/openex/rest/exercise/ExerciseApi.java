package io.openex.rest.exercise;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.database.model.*;
import io.openex.database.repository.*;
import io.openex.database.specification.ComcheckSpecification;
import io.openex.database.specification.DryRunSpecification;
import io.openex.database.specification.ExerciseLogSpecification;
import io.openex.rest.exercise.export.ExerciseFileExport;
import io.openex.rest.exercise.export.ExerciseFileImport;
import io.openex.rest.exercise.export.ExerciseImport;
import io.openex.rest.exercise.form.*;
import io.openex.rest.helper.RestBehavior;
import io.openex.service.DryrunService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import javax.annotation.security.RolesAllowed;
import javax.transaction.Transactional;
import javax.validation.Valid;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static io.openex.config.AppConfig.currentUser;
import static io.openex.database.model.User.ROLE_USER;
import static io.openex.helper.DatabaseHelper.resolveRelation;
import static io.openex.helper.DatabaseHelper.updateRelation;
import static java.time.Instant.now;

@RestController
@RolesAllowed(ROLE_USER)
public class ExerciseApi<T> extends RestBehavior {

    // region resources
    @Resource
    private ObjectMapper mapper;
    // endregion

    // region repositories
    private TagRepository tagRepository;
    private DocumentRepository documentRepository;
    private ExerciseRepository exerciseRepository;
    private ExerciseLogRepository exerciseLogRepository;
    private DryRunRepository dryRunRepository;
    private ComcheckRepository comcheckRepository;
    private GroupRepository groupRepository;
    private AudienceRepository audienceRepository;
    private InjectRepository injectRepository;
    // endregion

    // region services
    private DryrunService<T> dryrunService;
    // endregion

    // region setters
    @Autowired
    public void setAudienceRepository(AudienceRepository audienceRepository) {
        this.audienceRepository = audienceRepository;
    }

    @Autowired
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
    }

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

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
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }
    // endregion

    // region logs
    @GetMapping("/api/exercises/{exercise}/logs")
    public Iterable<ExerciseLog> logs(@PathVariable String exercise) {
        return exerciseLogRepository.findAll(ExerciseLogSpecification.fromExercise(exercise));
    }

    @PostMapping("/api/exercises/{exerciseId}/logs")
    public ExerciseLog createLog(@PathVariable String exerciseId,
                                 @Valid @RequestBody LogCreateInput createLogInput) {
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
    public Dryrun createDryrun(@PathVariable String exerciseId,
                               @Valid @RequestBody DryRunCreateInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        return dryrunService.provisionDryrun(exercise, input.getSpeed());
    }

    @GetMapping("/api/exercises/{exerciseId}/dryruns/{dryrunId}")
    public Dryrun dryrun(@PathVariable String exerciseId,
                         @PathVariable String dryrunId) {
        Specification<Dryrun> filters = DryRunSpecification
                .fromExercise(exerciseId).and(DryRunSpecification.id(dryrunId));
        return dryRunRepository.findOne(filters).orElseThrow();
    }

    @DeleteMapping("/api/exercises/{exerciseId}/dryruns/{dryrunId}")
    public void deleteDryrun(@PathVariable String exerciseId, @PathVariable String dryrunId) {
        dryRunRepository.deleteById(dryrunId);
    }

    @GetMapping("/api/exercises/{exerciseId}/dryruns/{dryrunId}/dryinjects")
    public List<DryInject<?>> dryrunInjects(@PathVariable String exerciseId,
                                            @PathVariable String dryrunId) {
        return dryrun(exerciseId, dryrunId).getInjects();
    }
    // endregion

    // region comchecks
    @GetMapping("/api/exercises/{exercise}/comchecks")
    public Iterable<Comcheck> comchecks(@PathVariable String exercise) {
        return comcheckRepository.findAll(ComcheckSpecification.fromExercise(exercise));
    }

    @GetMapping("/api/exercises/{exercise}/comchecks/{comcheck}")
    public Comcheck comcheck(@PathVariable String exercise,
                             @PathVariable String comcheck) {
        Specification<Comcheck> filters = ComcheckSpecification
                .fromExercise(exercise).and(ComcheckSpecification.id(comcheck));
        return comcheckRepository.findOne(filters).orElseThrow();
    }

    @GetMapping("/api/exercises/{exercise}/comchecks/{comcheck}/statuses")
    public List<ComcheckStatus> comcheckStatuses(@PathVariable String exercise,
                                                 @PathVariable String comcheck) {
        return comcheck(exercise, comcheck).getComcheckStatus();
    }
    // endregion

    // region exercises
    @PostMapping("/api/exercises")
    public Exercise createExercise(@Valid @RequestBody ExerciseCreateInput input) {
        Exercise exercise = new Exercise();
        exercise.setUpdateAttributes(input);
        exercise.setOwner(currentUser());
        exercise.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        return exerciseRepository.save(exercise);
    }

    @PutMapping("/api/exercises/{exerciseId}/start")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public Exercise startExercise(@PathVariable String exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        exercise.setStart(Date.from(now().plus(10, ChronoUnit.SECONDS))); // Start in 10 sec
        return exerciseRepository.save(exercise);
    }

    @PutMapping("/api/exercises/{exerciseId}/information")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public Exercise updateExerciseInformation(@PathVariable String exerciseId,
                                              @Valid @RequestBody ExerciseUpdateInfoInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        exercise.setUpdateAttributes(input);
        exercise.setAnimationGroup(updateRelation(input.getAnimationGroup(), exercise.getAnimationGroup(), groupRepository));
        return exerciseRepository.save(exercise);
    }

    @PutMapping("/api/exercises/{exerciseId}/tags")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public Exercise updateExerciseTags(@PathVariable String exerciseId,
                                       @Valid @RequestBody ExerciseUpdateTagsInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        exercise.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        return exerciseRepository.save(exercise);
    }

    @PutMapping("/api/exercises/{exerciseId}/image")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public Exercise updateExerciseImage(@PathVariable String exerciseId,
                                        @Valid @RequestBody ExerciseUpdateImageInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        exercise.setImage(documentRepository.findById(input.getImageId()).orElse(null));
        return exerciseRepository.save(exercise);
    }

    @DeleteMapping("/api/exercises/{exerciseId}")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public void deleteExercise(@PathVariable String exerciseId) {
        exerciseRepository.deleteById(exerciseId);
    }

    @GetMapping("/api/exercises/{exerciseId}")
    @PostAuthorize("isExerciseObserver(#exerciseId)")
    public Exercise exercise(@PathVariable String exerciseId) {
        return exerciseRepository.findById(exerciseId).orElseThrow();
    }

    @PostMapping("/api/exercises/{exerciseId}/export")
    @PostAuthorize("isExerciseObserver(#exerciseId)")
    public ResponseEntity<ExerciseFileExport> exerciseExport(@PathVariable String exerciseId) {
        ExerciseFileExport importExport = new ExerciseFileExport();
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        importExport.setExercise(exercise);
        importExport.setAudiences(exercise.getAudiences());
        importExport.setInjects(exercise.getInjects());
        importExport.setTags(exercise.getTags());
        String attachmentName = "attachment; filename=" + exercise.getName() + "_" + Instant.now().toString() + ".json";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, attachmentName)
                .contentType(MediaType.parseMediaType("application/json"))
                .body(importExport);
    }

    @Transactional
    @PostMapping("/api/exercises/import")
    @PostAuthorize("isExerciseObserver(#exerciseId)")
    public Exercise exerciseImport(@RequestPart("file") MultipartFile file) throws Exception {
        ExerciseFileImport dataImport = mapper.readValue(file.getInputStream(), ExerciseFileImport.class);
        // Create tags
        Map<String, Tag> tagMap = fromIterable(tagRepository.findAll()).stream().collect(
                Collectors.toMap(Tag::getName, Function.identity()));
        List<Tag> tagsToCreate = dataImport.getTags().stream()
                .filter(tagImport -> tagMap.get(tagImport.getName()) == null)
                .map(tagImport -> {
                    Tag tag = new Tag();
                    tag.setUpdateAttributes(tagImport);
                    return tag;
                }).toList();
        List<Tag> createdTags = fromIterable(tagRepository.saveAll(tagsToCreate));
        List<Tag> tagsToRemap = dataImport.getTags().stream()
                .filter(tagImport -> tagMap.get(tagImport.getName()) != null)
                .map(tagImport -> tagMap.get(tagImport.getName())).toList();
        List<Tag> exerciseTags = Stream.concat(createdTags.stream(), tagsToRemap.stream()).toList();
        // Create exercise
        ExerciseImport inputExercise = dataImport.getExercise();
        Exercise exerciseToSave = new Exercise();
        exerciseToSave.setUpdateAttributes(inputExercise);
        exerciseToSave.setOwner(currentUser());
        exerciseToSave.setTags(exerciseTags);
        exerciseToSave.setAnimationGroup(resolveRelation(inputExercise.getAnimationGroup(), groupRepository));
        exerciseToSave.setImage(resolveRelation(inputExercise.getImage(), documentRepository));
        Exercise exercise = exerciseRepository.save(exerciseToSave);
        // Create audiences
        List<Audience> audiences = dataImport.getAudiences().stream()
                .map(audienceImport -> {
                    Audience audience = new Audience();
                    audience.setUpdateAttributes(audienceImport);
                    audience.setExercise(exercise);
                    // audience.setUsers();
                    return audience;
                }).toList();
        audienceRepository.saveAll(audiences);
        // Create injects
        // TODO
        // Return exercise
        return exerciseRepository.findById(exercise.getId()).orElseThrow();
    }

    @GetMapping("/api/exercises")
    @RolesAllowed(ROLE_USER)
    public Iterable<Exercise> exercises() {
        return currentUser().isAdmin() ?
                exerciseRepository.findAll() :
                exerciseRepository.findAllGranted(currentUser().getId());
    }
    // endregion
}
