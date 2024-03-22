package io.openex.rest.exercise;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.config.OpenExConfig;
import io.openex.database.model.*;
import io.openex.database.model.Exercise.STATUS;
import io.openex.database.repository.*;
import io.openex.database.specification.*;
import io.openex.rest.exception.InputValidationException;
import io.openex.rest.exercise.exports.ExerciseExportMixins;
import io.openex.rest.exercise.exports.ExerciseFileExport;
import io.openex.rest.exercise.exports.VariableMixin;
import io.openex.rest.exercise.exports.VariableWithValueMixin;
import io.openex.rest.exercise.form.*;
import io.openex.rest.helper.RestBehavior;
import io.openex.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.util.function.Tuples;

import javax.annotation.Resource;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static io.openex.config.SessionHelper.currentUser;
import static io.openex.database.model.Exercise.STATUS.*;
import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.database.model.User.ROLE_USER;
import static io.openex.helper.StreamHelper.fromIterable;
import static io.openex.service.ImportService.EXPORT_ENTRY_ATTACHMENT;
import static io.openex.service.ImportService.EXPORT_ENTRY_EXERCISE;
import static java.time.Duration.between;
import static java.time.Instant.now;
import static java.time.temporal.ChronoUnit.MINUTES;

@RestController
@RolesAllowed(ROLE_USER)
public class ExerciseApi extends RestBehavior {

  private static final Logger LOGGER = Logger.getLogger(ExerciseApi.class.getName());

  // region properties
  @Value("${openex.mail.imap.enabled}")
  private boolean imapEnabled;

  @Value("${openex.mail.imap.username}")
  private String imapUsername;

  @Resource
  private OpenExConfig openExConfig;
  // endregion

  // region repositories
  private LogRepository logRepository;
  private TagRepository tagRepository;
  private UserRepository userRepository;
  private PauseRepository pauseRepository;
  private GroupRepository groupRepository;
  private GrantRepository grantRepository;
  private DocumentRepository documentRepository;
  private ExerciseRepository exerciseRepository;
  private LogRepository exerciseLogRepository;
  private DryRunRepository dryRunRepository;
  private DryInjectRepository dryInjectRepository;
  private ComcheckRepository comcheckRepository;
  private ImportService importService;
  private InjectRepository injectRepository;
  private LessonsCategoryRepository lessonsCategoryRepository;
  private LessonsQuestionRepository lessonsQuestionRepository;
  private LessonsAnswerRepository lessonsAnswerRepository;
  // endregion

  // region services
  private DryrunService dryrunService;
  private FileService fileService;
  private InjectService injectService;
  private ChallengeService challengeService;
  private VariableService variableService;
  // endregion

  // region setters
  @Autowired
  public void setChallengeService(ChallengeService challengeService) {
    this.challengeService = challengeService;
  }

  @Autowired
  public void setInjectService(InjectService injectService) {
    this.injectService = injectService;
  }

  @Autowired
  public void setImportService(ImportService importService) {
    this.importService = importService;
  }

  @Autowired
  public void setLogRepository(LogRepository logRepository) {
    this.logRepository = logRepository;
  }

  @Autowired
  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Autowired
  public void setPauseRepository(PauseRepository pauseRepository) {
    this.pauseRepository = pauseRepository;
  }

  @Autowired
  public void setGrantRepository(GrantRepository grantRepository) {
    this.grantRepository = grantRepository;
  }

  @Autowired
  public void setGroupRepository(GroupRepository groupRepository) {
    this.groupRepository = groupRepository;
  }

  @Autowired
  public void setDryrunService(DryrunService dryrunService) {
    this.dryrunService = dryrunService;
  }

  @Autowired
  public void setInjectRepository(InjectRepository injectRepository) {
    this.injectRepository = injectRepository;
  }

  @Autowired
  public void setFileService(FileService fileService) {
    this.fileService = fileService;
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
  public void setComcheckRepository(ComcheckRepository comcheckRepository) {
    this.comcheckRepository = comcheckRepository;
  }

  @Autowired
  public void setDryRunRepository(DryRunRepository dryRunRepository) {
    this.dryRunRepository = dryRunRepository;
  }

  @Autowired
  public void setDryInjectRepository(DryInjectRepository dryInjectRepository) {
    this.dryInjectRepository = dryInjectRepository;
  }

  @Autowired
  public void setExerciseLogRepository(LogRepository exerciseLogRepository) {
    this.exerciseLogRepository = exerciseLogRepository;
  }

  @Autowired
  public void setExerciseRepository(ExerciseRepository exerciseRepository) {
    this.exerciseRepository = exerciseRepository;
  }

  @Autowired
  public void setLessonsCategoryRepository(LessonsCategoryRepository lessonsCategoryRepository) {
    this.lessonsCategoryRepository = lessonsCategoryRepository;
  }

  @Autowired
  public void setLessonsQuestionRepository(LessonsQuestionRepository lessonsQuestionRepository) {
    this.lessonsQuestionRepository = lessonsQuestionRepository;
  }

  @Autowired
  public void setLessonsAnswerRepository(LessonsAnswerRepository lessonsAnswerRepository) {
    this.lessonsAnswerRepository = lessonsAnswerRepository;
  }

  @Autowired
  public void setVariableService(@NotNull final VariableService variableService) {
    this.variableService = variableService;
  }
  // endregion

  // region logs
  @GetMapping("/api/exercises/{exercise}/logs")
  public Iterable<Log> logs(@PathVariable String exercise) {
    return exerciseLogRepository.findAll(ExerciseLogSpecification.fromExercise(exercise));
  }

  @PostMapping("/api/exercises/{exerciseId}/logs")
  public Log createLog(@PathVariable String exerciseId, @Valid @RequestBody LogCreateInput input) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    Log log = new Log();
    log.setUpdateAttributes(input);
    log.setExercise(exercise);
    log.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    log.setUser(userRepository.findById(currentUser().getId()).orElseThrow());
    return exerciseLogRepository.save(log);
  }

  @PutMapping("/api/exercises/{exerciseId}/logs/{logId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Log updateLog(@PathVariable String exerciseId, @PathVariable String logId,
      @Valid @RequestBody LogCreateInput input) {
    Log log = logRepository.findById(logId).orElseThrow();
    log.setUpdateAttributes(input);
    log.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    return logRepository.save(log);
  }

  @DeleteMapping("/api/exercises/{exerciseId}/logs/{logId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public void deleteLog(@PathVariable String exerciseId, @PathVariable String logId) {
    logRepository.deleteById(logId);
  }
  // endregion

  // region dryruns
  @GetMapping("/api/exercises/{exerciseId}/dryruns")
  public Iterable<Dryrun> dryruns(@PathVariable String exerciseId) {
    return dryRunRepository.findAll(DryRunSpecification.fromExercise(exerciseId));
  }

  @PostMapping("/api/exercises/{exerciseId}/dryruns")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Dryrun createDryrun(@PathVariable String exerciseId, @Valid @RequestBody DryrunCreateInput input) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    List<String> userIds = input.getUserIds();
    List<User> users = userIds.size() == 0 ? List.of(userRepository.findById(currentUser().getId()).orElseThrow())
        : fromIterable(userRepository.findAllById(userIds));
    return dryrunService.provisionDryrun(exercise, users, input.getName());
  }

  @GetMapping("/api/exercises/{exerciseId}/dryruns/{dryrunId}")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Dryrun dryrun(@PathVariable String exerciseId, @PathVariable String dryrunId) {
    Specification<Dryrun> filters = DryRunSpecification.fromExercise(exerciseId).and(DryRunSpecification.id(dryrunId));
    return dryRunRepository.findOne(filters).orElseThrow();
  }

  @DeleteMapping("/api/exercises/{exerciseId}/dryruns/{dryrunId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public void deleteDryrun(@PathVariable String exerciseId, @PathVariable String dryrunId) {
    dryRunRepository.deleteById(dryrunId);
  }

  @GetMapping("/api/exercises/{exerciseId}/dryruns/{dryrunId}/dryinjects")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public List<DryInject> dryrunInjects(@PathVariable String exerciseId, @PathVariable String dryrunId) {
    return dryInjectRepository.findAll(DryInjectSpecification.fromDryRun(dryrunId));
  }
  // endregion

  // region comchecks
  @GetMapping("/api/exercises/{exercise}/comchecks")
  public Iterable<Comcheck> comchecks(@PathVariable String exercise) {
    return comcheckRepository.findAll(ComcheckSpecification.fromExercise(exercise));
  }

  @GetMapping("/api/exercises/{exercise}/comchecks/{comcheck}")
  public Comcheck comcheck(@PathVariable String exercise, @PathVariable String comcheck) {
    Specification<Comcheck> filters = ComcheckSpecification.fromExercise(exercise)
        .and(ComcheckSpecification.id(comcheck));
    return comcheckRepository.findOne(filters).orElseThrow();
  }

  @GetMapping("/api/exercises/{exercise}/comchecks/{comcheck}/statuses")
  public List<ComcheckStatus> comcheckStatuses(@PathVariable String exercise, @PathVariable String comcheck) {
    return comcheck(exercise, comcheck).getComcheckStatus();
  }
  // endregion

  // region exercises
  @Transactional(rollbackOn = Exception.class)
  @PostMapping("/api/exercises")
  public Exercise createExercise(@Valid @RequestBody ExerciseCreateInput input) {
    Exercise exercise = new Exercise();
    exercise.setUpdateAttributes(input);
    exercise.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    if (imapEnabled) {
      exercise.setReplyTo(imapUsername);
    } else {
      exercise.setReplyTo(openExConfig.getDefaultMailer());
    }
    // Find automatic groups to grants
    List<Group> groups = fromIterable(groupRepository.findAll());
    List<Grant> grants = groups.stream().filter(group -> group.getExercisesDefaultGrants().size() > 0)
        .flatMap(group -> group.getExercisesDefaultGrants().stream().map(s -> Tuples.of(group, s))).map(tuple -> {
          Grant grant = new Grant();
          grant.setGroup(tuple.getT1());
          grant.setName(tuple.getT2());
          grant.setExercise(exercise);
          return grant;
        }).toList();
    if (grants.size() > 0) {
      Iterable<Grant> exerciseGrants = grantRepository.saveAll(grants);
      exercise.setGrants(fromIterable(exerciseGrants));
    }
    return exerciseRepository.save(exercise);
  }

  @PutMapping("/api/exercises/{exerciseId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Exercise updateExerciseInformation(@PathVariable String exerciseId,
      @Valid @RequestBody ExerciseUpdateInput input) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    exercise.setUpdateAttributes(input);
    return exerciseRepository.save(exercise);
  }

  @PutMapping("/api/exercises/{exerciseId}/start_date")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Exercise updateExerciseStart(@PathVariable String exerciseId,
      @Valid @RequestBody ExerciseUpdateStartDateInput input) throws InputValidationException {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    if (!exercise.getStatus().equals(SCHEDULED)) {
      String message = "Change date is only possible in scheduling state";
      throw new InputValidationException("exercise_start_date", message);
    }
    exercise.setUpdateAttributes(input);
    return exerciseRepository.save(exercise);
  }

  @PutMapping("/api/exercises/{exerciseId}/tags")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Exercise updateExerciseTags(@PathVariable String exerciseId,
      @Valid @RequestBody ExerciseUpdateTagsInput input) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    exercise.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    return exerciseRepository.save(exercise);
  }

  @PutMapping("/api/exercises/{exerciseId}/logos")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Exercise updateExerciseLogos(@PathVariable String exerciseId,
      @Valid @RequestBody ExerciseUpdateLogoInput input) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    exercise.setLogoDark(documentRepository.findById(input.getLogoDark()).orElse(null));
    exercise.setLogoLight(documentRepository.findById(input.getLogoLight()).orElse(null));
    return exerciseRepository.save(exercise);
  }

  @PutMapping("/api/exercises/{exerciseId}/lessons")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Exercise updateExerciseLessons(@PathVariable String exerciseId,
      @Valid @RequestBody ExerciseLessonsInput input) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    exercise.setLessonsAnonymized(input.getLessonsAnonymized());
    return exerciseRepository.save(exercise);
  }

  @DeleteMapping("/api/exercises/{exerciseId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public void deleteExercise(@PathVariable String exerciseId) {
    exerciseRepository.deleteById(exerciseId);
  }

  @GetMapping("/api/exercises/{exerciseId}")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Exercise exercise(@PathVariable String exerciseId) {
    return exerciseRepository.findById(exerciseId).orElseThrow();
  }

  @Transactional(rollbackOn = Exception.class)
  @DeleteMapping("/api/exercises/{exerciseId}/{documentId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Exercise deleteDocument(@PathVariable String exerciseId, @PathVariable String documentId) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    exercise.setUpdatedAt(now());
    Document doc = documentRepository.findById(documentId).orElseThrow();
    List<Exercise> docExercises = doc.getExercises().stream().filter(ex -> !ex.getId().equals(exerciseId)).toList();
    if (docExercises.isEmpty()) {
      // Document is no longer associate to any exercise, delete it
      documentRepository.delete(doc);
      // All associations with this document will be automatically cleanup.
    } else {
      // Document associated to other exercise, cleanup
      doc.setExercises(docExercises);
      documentRepository.save(doc);
      // Delete document from all exercise injects
      injectService.cleanInjectsDocExercise(exerciseId, documentId);
    }
    return exerciseRepository.save(exercise);
  }

  @Transactional(rollbackOn = Exception.class)
  @PutMapping("/api/exercises/{exerciseId}/status")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Exercise changeExerciseStatus(@PathVariable String exerciseId,
      @Valid @RequestBody ExerciseUpdateStatusInput input) {
    STATUS status = input.getStatus();
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    // Check if next status is possible
    List<STATUS> nextPossibleStatus = exercise.nextPossibleStatus();
    if (!nextPossibleStatus.contains(status)) {
      throw new UnsupportedOperationException("Exercise cant support moving to status " + status.name());
    }
    // In case of rescheduled of an exercise.
    boolean isCloseState = CANCELED.equals(exercise.getStatus()) || FINISHED.equals(exercise.getStatus());
    if (isCloseState && SCHEDULED.equals(status)) {
      exercise.setStart(null);
      exercise.setEnd(null);
      // Reset pauses
      exercise.setCurrentPause(null);
      pauseRepository.deleteAll(pauseRepository.findAllForExercise(exerciseId));
      // Reset injects outcome, communications and expectations
      injectRepository.saveAll(injectRepository.findAllForExercise(exerciseId)
          .stream().peek(Inject::clean).toList());
      // Reset lessons learned answers
      List<LessonsAnswer> lessonsAnswers = lessonsCategoryRepository.findAll(
              LessonsCategorySpecification.fromExercise(exerciseId)).stream()
          .flatMap(lessonsCategory -> lessonsQuestionRepository.findAll(
                  LessonsQuestionSpecification.fromCategory(lessonsCategory.getId())).stream()
              .flatMap(lessonsQuestion -> lessonsAnswerRepository.findAll(
                  LessonsAnswerSpecification.fromQuestion(lessonsQuestion.getId())).stream()))
          .toList();
      lessonsAnswerRepository.deleteAll(lessonsAnswers);
      // Delete exercise transient files (communications, ...)
      fileService.deleteDirectory(exerciseId);
    }
    // In case of manual start
    if (SCHEDULED.equals(exercise.getStatus()) && RUNNING.equals(status)) {
      Instant nextMinute = now().truncatedTo(MINUTES).plus(1, MINUTES);
      exercise.setStart(nextMinute);
    }
    // If exercise move from pause to running state,
    // we log the pause date to be able to recompute inject dates.
    if (PAUSED.equals(exercise.getStatus()) && RUNNING.equals(status)) {
      Instant lastPause = exercise.getCurrentPause().orElseThrow();
      exercise.setCurrentPause(null);
      Pause pause = new Pause();
      pause.setDate(lastPause);
      pause.setExercise(exercise);
      pause.setDuration(between(lastPause, now()).getSeconds());
      pauseRepository.save(pause);
    }
    // If pause is asked, just set the pause date.
    if (RUNNING.equals(exercise.getStatus()) && PAUSED.equals(status)) {
      exercise.setCurrentPause(Instant.now());
    }
    // Cancelation
    if (RUNNING.equals(exercise.getStatus()) && CANCELED.equals(status)) {
      exercise.setEnd(now());
    }
    exercise.setUpdatedAt(now());
    exercise.setStatus(status);
    return exerciseRepository.save(exercise);
  }

  @GetMapping("/api/exercises")
  @RolesAllowed(ROLE_USER)
  public List<ExerciseSimple> exercises() {
    Iterable<Exercise> exercises = currentUser().isAdmin() ? exerciseRepository.findAll()
        : exerciseRepository.findAllGranted(currentUser().getId());
    return fromIterable(exercises).stream().map(ExerciseSimple::fromExercise).toList();
  }
  // endregion

  // region communication
  @GetMapping("/api/exercises/{exerciseId}/communications")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Iterable<Communication> exerciseCommunications(@PathVariable String exerciseId) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    List<Communication> communications = new ArrayList<>();
    exercise.getInjects().forEach(injectDoc -> communications.addAll(injectDoc.getCommunications()));
    return communications;
  }

  @GetMapping("/api/communications/attachment")
  // @PreAuthorize("isExerciseObserver(#exerciseId)")
  public void downloadAttachment(@RequestParam String file, HttpServletResponse response) throws IOException {
    FileContainer fileContainer = fileService.getFileContainer(file).orElseThrow();
    response.addHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileContainer.getName());
    response.addHeader(HttpHeaders.CONTENT_TYPE, fileContainer.getContentType());
    response.setStatus(HttpServletResponse.SC_OK);
    fileContainer.getInputStream().transferTo(response.getOutputStream());
  }
  // endregion

  // region import/export
  @GetMapping("/api/exercises/{exerciseId}/export")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public void exerciseExport(
      @NotBlank @PathVariable final String exerciseId,
      @RequestParam(required = false) final boolean isWithPlayers,
      @RequestParam(required = false) final boolean isWithVariableValues,
      HttpServletResponse response) throws IOException {
    // Setup the mapper for export
    List<String> documentIds = new ArrayList<>();
    ObjectMapper objectMapper = mapper.copy();
    if (!isWithPlayers) {
      objectMapper.addMixIn(ExerciseFileExport.class, ExerciseExportMixins.ExerciseFileExport.class);
    }
    // Start exporting exercise
    ExerciseFileExport importExport = new ExerciseFileExport();
    importExport.setVersion(1);
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    objectMapper.addMixIn(Exercise.class, ExerciseExportMixins.Exercise.class);
    // Build the export
    importExport.setExercise(exercise);
    importExport.setDocuments(exercise.getDocuments());
    documentIds.addAll(exercise.getDocuments().stream().map(Document::getId).toList());
    objectMapper.addMixIn(Document.class, ExerciseExportMixins.Document.class);
    List<Tag> exerciseTags = new ArrayList<>(exercise.getTags());
    // Objectives
    List<Objective> objectives = exercise.getObjectives();
    importExport.setObjectives(objectives);
    objectMapper.addMixIn(Objective.class, ExerciseExportMixins.Objective.class);
    // Lessons categories
    List<LessonsCategory> lessonsCategories = exercise.getLessonsCategories();
    importExport.setLessonsCategories(lessonsCategories);
    objectMapper.addMixIn(LessonsCategory.class, ExerciseExportMixins.LessonsCategory.class);
    // Lessons questions
    List<LessonsQuestion> lessonsQuestions = lessonsCategories.stream()
        .flatMap(category -> category.getQuestions().stream()).toList();
    importExport.setLessonsQuestions(lessonsQuestions);
    objectMapper.addMixIn(LessonsQuestion.class, ExerciseExportMixins.LessonsQuestion.class);
    // Audiences
    List<Audience> audiences = exercise.getAudiences();
    importExport.setAudiences(audiences);
    objectMapper.addMixIn(Audience.class,
        isWithPlayers ? ExerciseExportMixins.Audience.class : ExerciseExportMixins.EmptyAudience.class);
    exerciseTags.addAll(audiences.stream().flatMap(audience -> audience.getTags().stream()).toList());
    if (isWithPlayers) {
      // players
      List<User> players = audiences.stream().flatMap(audience -> audience.getUsers().stream()).distinct().toList();
      exerciseTags.addAll(players.stream().flatMap(user -> user.getTags().stream()).toList());
      importExport.setUsers(players);
      objectMapper.addMixIn(User.class, ExerciseExportMixins.User.class);
      // organizations
      List<Organization> organizations = players.stream().map(User::getOrganization).filter(Objects::nonNull).toList();
      exerciseTags.addAll(organizations.stream().flatMap(org -> org.getTags().stream()).toList());
      importExport.setOrganizations(organizations);
      objectMapper.addMixIn(Organization.class, ExerciseExportMixins.Organization.class);
    }
    // Injects
    List<Inject> injects = exercise.getInjects();
    exerciseTags.addAll(injects.stream().flatMap(inject -> inject.getTags().stream()).toList());
    importExport.setInjects(injects);
    objectMapper.addMixIn(Inject.class, ExerciseExportMixins.Inject.class);
    // Documents
    exerciseTags.addAll(exercise.getDocuments().stream().flatMap(doc -> doc.getTags().stream()).toList());
    // Articles / Medias
    List<Article> articles = exercise.getArticles();
    importExport.setArticles(articles);
    objectMapper.addMixIn(Article.class, ExerciseExportMixins.Article.class);
    List<Media> medias = articles.stream().map(Article::getMedia).distinct().toList();
    documentIds.addAll(medias.stream().flatMap(media -> media.getLogos().stream()).map(Document::getId).toList());
    importExport.setMedias(medias);
    objectMapper.addMixIn(Media.class, ExerciseExportMixins.Media.class);
    // Challenges
    List<Challenge> challenges = fromIterable(challengeService.getExerciseChallenges(exerciseId));
    importExport.setChallenges(challenges);
    documentIds.addAll(
        challenges.stream().flatMap(challenge -> challenge.getDocuments().stream()).map(Document::getId).toList());
    objectMapper.addMixIn(Challenge.class, ExerciseExportMixins.Challenge.class);
    exerciseTags.addAll(challenges.stream().flatMap(challenge -> challenge.getTags().stream()).toList());
    // Tags
    importExport.setTags(exerciseTags.stream().distinct().toList());
    objectMapper.addMixIn(Tag.class, ExerciseExportMixins.Tag.class);
    // -- Variables --
    List<Variable> variables = this.variableService.variables(exerciseId);
    importExport.setVariables(variables);
    if (isWithVariableValues) {
      objectMapper.addMixIn(Variable.class, VariableWithValueMixin.class);
    } else {
      objectMapper.addMixIn(Variable.class, VariableMixin.class);
    }
    // Build the response
    String infos = "("
        + (isWithPlayers ? "with_players" : "no_players")
        + " & "
        + (isWithVariableValues ? "with_variable_values" : "no_variable_values")
        + ")";
    String zipName =
        (exercise.getName() + "_" + now().toString()) + "_" + infos + ".zip";
    response.addHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + zipName);
    response.addHeader(HttpHeaders.CONTENT_TYPE, "application/zip");
    response.setStatus(HttpServletResponse.SC_OK);
    ZipOutputStream zipExport = new ZipOutputStream(response.getOutputStream());
    ZipEntry zipEntry = new ZipEntry(exercise.getName() + ".json");
    zipEntry.setComment(EXPORT_ENTRY_EXERCISE);
    zipExport.putNextEntry(zipEntry);
    zipExport.write(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(importExport));
    zipExport.closeEntry();
    // Add the documents
    documentIds.stream().distinct().forEach(docId -> {
      Document doc = documentRepository.findById(docId).orElseThrow();
      Optional<InputStream> docStream = fileService.getFile(doc);
      if (docStream.isPresent()) {
        try {
          ZipEntry zipDoc = new ZipEntry(doc.getTarget());
          zipDoc.setComment(EXPORT_ENTRY_ATTACHMENT);
          byte[] data = docStream.get().readAllBytes();
          zipExport.putNextEntry(zipDoc);
          zipExport.write(data);
          zipExport.closeEntry();
        } catch (IOException e) {
          LOGGER.log(Level.SEVERE, e.getMessage(), e);
        }
      }
    });
    zipExport.finish();
    zipExport.close();
  }

  @PostMapping("/api/exercises/import")
  @RolesAllowed(ROLE_ADMIN)
  public void exerciseImport(@RequestPart("file") MultipartFile file) throws Exception {
    importService.handleFileImport(file);
  }

  // endregion
}
