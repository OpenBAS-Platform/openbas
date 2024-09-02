package io.openbas.rest.exercise;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import io.openbas.database.raw.*;
import io.openbas.database.repository.*;
import io.openbas.database.specification.*;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.exception.InputValidationException;
import io.openbas.rest.exercise.exports.ExerciseExportMixins;
import io.openbas.rest.exercise.exports.ExerciseFileExport;
import io.openbas.rest.exercise.exports.VariableMixin;
import io.openbas.rest.exercise.exports.VariableWithValueMixin;
import io.openbas.rest.exercise.form.*;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.helper.TeamHelper;
import io.openbas.rest.inject.form.InjectExpectationResultsByAttackPattern;
import io.openbas.service.*;
import io.openbas.utils.AtomicTestingMapper.ExpectationResultsByType;
import io.openbas.utils.ResultUtils;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.database.specification.ExerciseSpecification.findGrantedFor;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.service.ImportService.EXPORT_ENTRY_ATTACHMENT;
import static io.openbas.service.ImportService.EXPORT_ENTRY_EXERCISE;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationCriteriaBuilder;
import static java.time.Duration.between;
import static java.time.Instant.now;
import static java.time.temporal.ChronoUnit.MINUTES;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
public class ExerciseApi extends RestBehavior {

    public static final String EXERCISE_URI = "/api/exercises";

    private static final Logger LOGGER = Logger.getLogger(ExerciseApi.class.getName());

    // region repositories
    private final LogRepository logRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final PauseRepository pauseRepository;
    private final DocumentRepository documentRepository;
    private final ExerciseRepository exerciseRepository;
    private final TeamRepository teamRepository;
    private final ExerciseTeamUserRepository exerciseTeamUserRepository;
    private final LogRepository exerciseLogRepository;
    private final DryRunRepository dryRunRepository;
    private final DryInjectRepository dryInjectRepository;
    private final ComcheckRepository comcheckRepository;
    private final ImportService importService;
    private final LessonsCategoryRepository lessonsCategoryRepository;
    private final LessonsQuestionRepository lessonsQuestionRepository;
    private final LessonsAnswerRepository lessonsAnswerRepository;
    private final InjectStatusRepository injectStatusRepository;
    private final InjectRepository injectRepository;
    private final InjectExpectationRepository injectExpectationRepository;
    private final ScenarioRepository scenarioRepository;
    private final CommunicationRepository communicationRepository;
    private final ObjectiveRepository objectiveRepository;
    private final EvaluationRepository evaluationRepository;
    private final KillChainPhaseRepository killChainPhaseRepository;
    private final GrantRepository grantRepository;
    // endregion

    // region services
    private final DryrunService dryrunService;
    private final FileService fileService;
    private final InjectService injectService;
    private final ChallengeService challengeService;
    private final VariableService variableService;
    private final ExerciseService exerciseService;
    // endregion

    // region logs
    @GetMapping(EXERCISE_URI + "/{exercise}/logs")
    public Iterable<Log> logs(@PathVariable String exercise) {
        return exerciseLogRepository.findAll(ExerciseLogSpecification.fromExercise(exercise));
    }

    @PostMapping(EXERCISE_URI + "/{exerciseId}/logs")
    @Transactional(rollbackOn = Exception.class)
    public Log createLog(@PathVariable String exerciseId, @Valid @RequestBody LogCreateInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        Log log = new Log();
        log.setUpdateAttributes(input);
        log.setExercise(exercise);
        log.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        log.setUser(userRepository.findById(currentUser().getId()).orElseThrow(ElementNotFoundException::new));
        return exerciseLogRepository.save(log);
    }

    @PutMapping(EXERCISE_URI + "/{exerciseId}/logs/{logId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public Log updateLog(@PathVariable String exerciseId, @PathVariable String logId,
                         @Valid @RequestBody LogCreateInput input) {
        Log log = logRepository.findById(logId).orElseThrow(ElementNotFoundException::new);
        log.setUpdateAttributes(input);
        log.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        return logRepository.save(log);
    }

    @DeleteMapping(EXERCISE_URI + "/{exerciseId}/logs/{logId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public void deleteLog(@PathVariable String exerciseId, @PathVariable String logId) {
        logRepository.deleteById(logId);
    }
    // endregion

    // region dryruns
    @GetMapping(EXERCISE_URI + "/{exerciseId}/dryruns")
    public Iterable<Dryrun> dryruns(@PathVariable String exerciseId) {
        return dryRunRepository.findAll(DryRunSpecification.fromExercise(exerciseId));
    }

    @PostMapping(EXERCISE_URI + "/{exerciseId}/dryruns")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public Dryrun createDryrun(@PathVariable String exerciseId, @Valid @RequestBody DryrunCreateInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        List<String> userIds = input.getUserIds();
        List<User> users = userIds.isEmpty() ? List.of(
                userRepository.findById(currentUser().getId()).orElseThrow(ElementNotFoundException::new))
                : fromIterable(userRepository.findAllById(userIds));
        return dryrunService.provisionDryrun(exercise, users, input.getName());
    }

    @GetMapping(EXERCISE_URI + "/{exerciseId}/dryruns/{dryrunId}")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Dryrun dryrun(@PathVariable String exerciseId, @PathVariable String dryrunId) {
        Specification<Dryrun> filters = DryRunSpecification.fromExercise(exerciseId).and(DryRunSpecification.id(dryrunId));
        return dryRunRepository.findOne(filters).orElseThrow(ElementNotFoundException::new);
    }

    @DeleteMapping(EXERCISE_URI + "/{exerciseId}/dryruns/{dryrunId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public void deleteDryrun(@PathVariable String exerciseId, @PathVariable String dryrunId) {
        dryRunRepository.deleteById(dryrunId);
    }

    @GetMapping(EXERCISE_URI + "/{exerciseId}/dryruns/{dryrunId}/dryinjects")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public List<DryInject> dryrunInjects(@PathVariable String exerciseId, @PathVariable String dryrunId) {
        return dryInjectRepository.findAll(DryInjectSpecification.fromDryRun(dryrunId));
    }
    // endregion

    // region comchecks
    @GetMapping(EXERCISE_URI + "/{exercise}/comchecks")
    public Iterable<Comcheck> comchecks(@PathVariable String exercise) {
        return comcheckRepository.findAll(ComcheckSpecification.fromExercise(exercise));
    }

    @GetMapping(EXERCISE_URI + "/{exercise}/comchecks/{comcheck}")
    public Comcheck comcheck(@PathVariable String exercise, @PathVariable String comcheck) {
        Specification<Comcheck> filters = ComcheckSpecification.fromExercise(exercise)
                .and(ComcheckSpecification.id(comcheck));
        return comcheckRepository.findOne(filters).orElseThrow(ElementNotFoundException::new);
    }

    @GetMapping(EXERCISE_URI + "/{exercise}/comchecks/{comcheck}/statuses")
    public List<ComcheckStatus> comcheckStatuses(@PathVariable String exercise, @PathVariable String comcheck) {
        return comcheck(exercise, comcheck).getComcheckStatus();
    }
    // endregion

    // region teams
    @GetMapping(EXERCISE_URI + "/{exerciseId}/teams")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<TeamSimple> getExerciseTeams(@PathVariable String exerciseId) {
        return TeamHelper.rawTeamToSimplerTeam(teamRepository.rawTeamByExerciseId(exerciseId),
                injectExpectationRepository, injectRepository, communicationRepository, exerciseTeamUserRepository, scenarioRepository);
    }

    @Transactional(rollbackOn = Exception.class)
    @PutMapping(EXERCISE_URI + "/{exerciseId}/teams/add")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Iterable<Team> addExerciseTeams(
            @PathVariable String exerciseId,
            @Valid @RequestBody ExerciseUpdateTeamsInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        List<Team> teams = exercise.getTeams();
        List<Team> teamsToAdd = fromIterable(teamRepository.findAllById(input.getTeamIds()));
        List<String> existingTeamIds = teams.stream().map(Team::getId).toList();
        teams.addAll(teamsToAdd.stream().filter(t -> !existingTeamIds.contains(t.getId())).toList());
        exercise.setTeams(teams);
        exercise.setUpdatedAt(now());
        return teamsToAdd;
    }

    @Transactional(rollbackOn = Exception.class)
    @PutMapping(EXERCISE_URI + "/{exerciseId}/teams/remove")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Iterable<Team> removeExerciseTeams(@PathVariable String exerciseId,
                                              @Valid @RequestBody ExerciseUpdateTeamsInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        // Remove teams from exercise
        List<Team> teams = exercise.getTeams().stream().filter(team -> !input.getTeamIds().contains(team.getId())).toList();
        exercise.setTeams(fromIterable(teams));
        exerciseRepository.save(exercise);
        // Remove all association between users / exercises / teams
        input.getTeamIds().forEach(exerciseTeamUserRepository::deleteTeamFromAllReferences);
        return teamRepository.findAllById(input.getTeamIds());
    }

    @Transactional(rollbackOn = Exception.class)
    @PutMapping(EXERCISE_URI + "/{exerciseId}/teams/{teamId}/players/enable")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Exercise enableExerciseTeamPlayers(@PathVariable String exerciseId, @PathVariable String teamId,
                                              @Valid @RequestBody ExerciseTeamPlayersEnableInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        Team team = teamRepository.findById(teamId).orElseThrow(ElementNotFoundException::new);
        input.getPlayersIds().forEach(playerId -> {
            ExerciseTeamUser exerciseTeamUser = new ExerciseTeamUser();
            exerciseTeamUser.setExercise(exercise);
            exerciseTeamUser.setTeam(team);
            exerciseTeamUser.setUser(userRepository.findById(playerId).orElseThrow(ElementNotFoundException::new));
            exerciseTeamUserRepository.save(exerciseTeamUser);
        });
        return exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
    }

    @Transactional(rollbackOn = Exception.class)
    @PutMapping(EXERCISE_URI + "/{exerciseId}/teams/{teamId}/players/disable")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Exercise disableExerciseTeamPlayers(@PathVariable String exerciseId, @PathVariable String teamId,
                                               @Valid @RequestBody ExerciseTeamPlayersEnableInput input) {
        input.getPlayersIds().forEach(playerId -> {
            ExerciseTeamUserId exerciseTeamUserId = new ExerciseTeamUserId();
            exerciseTeamUserId.setExerciseId(exerciseId);
            exerciseTeamUserId.setTeamId(teamId);
            exerciseTeamUserId.setUserId(playerId);
            exerciseTeamUserRepository.deleteById(exerciseTeamUserId);
        });
        return exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
    }

    @Transactional(rollbackOn = Exception.class)
    @PutMapping(EXERCISE_URI + "/{exerciseId}/teams/{teamId}/players/add")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Exercise addExerciseTeamPlayers(@PathVariable String exerciseId, @PathVariable String teamId,
                                           @Valid @RequestBody ExerciseTeamPlayersEnableInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        Team team = teamRepository.findById(teamId).orElseThrow(ElementNotFoundException::new);
        Iterable<User> teamUsers = userRepository.findAllById(input.getPlayersIds());
        team.getUsers().addAll(fromIterable(teamUsers));
        teamRepository.save(team);
        input.getPlayersIds().forEach(playerId -> {
            ExerciseTeamUser exerciseTeamUser = new ExerciseTeamUser();
            exerciseTeamUser.setExercise(exercise);
            exerciseTeamUser.setTeam(team);
            exerciseTeamUser.setUser(userRepository.findById(playerId).orElseThrow(ElementNotFoundException::new));
            exerciseTeamUserRepository.save(exerciseTeamUser);
        });
        return exercise;
    }

    @PutMapping(EXERCISE_URI + "/{exerciseId}/teams/{teamId}/players/remove")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public Exercise removeExerciseTeamPlayers(@PathVariable String exerciseId, @PathVariable String teamId,
                                              @Valid @RequestBody ExerciseTeamPlayersEnableInput input) {
        Team team = teamRepository.findById(teamId).orElseThrow(ElementNotFoundException::new);
        Iterable<User> teamUsers = userRepository.findAllById(input.getPlayersIds());
        team.getUsers().removeAll(fromIterable(teamUsers));
        teamRepository.save(team);
        input.getPlayersIds().forEach(playerId -> {
            ExerciseTeamUserId exerciseTeamUserId = new ExerciseTeamUserId();
            exerciseTeamUserId.setExerciseId(exerciseId);
            exerciseTeamUserId.setTeamId(teamId);
            exerciseTeamUserId.setUserId(playerId);
            exerciseTeamUserRepository.deleteById(exerciseTeamUserId);
        });
        return exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
    }
    // endregion

    // region exercises
    @PostMapping(EXERCISE_URI)
    public Exercise createExercise(@Valid @RequestBody ExerciseCreateInput input) {
        if (input == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exercise input cannot be null");
        }
        Exercise exercise = new Exercise();
        exercise.setUpdateAttributes(input);
        exercise.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
        return this.exerciseService.createExercise(exercise);
    }

    @PostMapping(EXERCISE_URI + "/{exerciseId}")
    @Transactional(rollbackOn = Exception.class)
    public Exercise duplicateExercise(@PathVariable @NotBlank final String exerciseId) {
        return exerciseService.getDuplicateExercise(exerciseId);
    }

    @PutMapping(EXERCISE_URI + "/{exerciseId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public Exercise updateExerciseInformation(@PathVariable String exerciseId,
                                              @Valid @RequestBody ExerciseUpdateInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        exercise.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
        exercise.setUpdateAttributes(input);
        return exerciseRepository.save(exercise);
    }

    @PutMapping(EXERCISE_URI + "/{exerciseId}/start_date")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public Exercise updateExerciseStart(@PathVariable String exerciseId,
                                        @Valid @RequestBody ExerciseUpdateStartDateInput input) throws InputValidationException {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        if (!exercise.getStatus().equals(ExerciseStatus.SCHEDULED)) {
            String message = "Change date is only possible in scheduling state";
            throw new InputValidationException("exercise_start_date", message);
        }
        exercise.setUpdateAttributes(input);
        return exerciseRepository.save(exercise);
    }

    @PutMapping(EXERCISE_URI + "/{exerciseId}/tags")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public Exercise updateExerciseTags(@PathVariable String exerciseId,
                                       @Valid @RequestBody ExerciseUpdateTagsInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        exercise.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        return exerciseRepository.save(exercise);
    }

    @PutMapping(EXERCISE_URI + "/{exerciseId}/logos")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public Exercise updateExerciseLogos(@PathVariable String exerciseId,
                                        @Valid @RequestBody ExerciseUpdateLogoInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        exercise.setLogoDark(documentRepository.findById(input.getLogoDark()).orElse(null));
        exercise.setLogoLight(documentRepository.findById(input.getLogoLight()).orElse(null));
        return exerciseRepository.save(exercise);
    }

    @PutMapping(EXERCISE_URI + "/{exerciseId}/lessons")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public Exercise updateExerciseLessons(@PathVariable String exerciseId,
                                          @Valid @RequestBody LessonsInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        exercise.setLessonsAnonymized(input.isLessonsAnonymized());
        return exerciseRepository.save(exercise);
    }

    @DeleteMapping(EXERCISE_URI + "/{exerciseId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public void deleteExercise(@PathVariable String exerciseId) {
        exerciseRepository.deleteById(exerciseId);
    }

    @GetMapping(EXERCISE_URI + "/{exerciseId}")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ExerciseDetails exercise(@PathVariable String exerciseId) {
        // We get the raw exercise
        RawExercise rawExercise = exerciseRepository.rawDetailsById(exerciseId);
        // We get the injects linked to this exercise
        List<RawInject> rawInjects = injectRepository.findRawByIds(
                rawExercise.getInject_ids().stream().distinct().toList());
        // We get the tuple exercise/team/user
        List<RawExerciseTeamUser> listRawExerciseTeamUsers = exerciseTeamUserRepository.rawByExerciseIds(
                List.of(exerciseId));
        // We get the objectives of this exercise
        List<RawObjective> rawObjectives = objectiveRepository.rawByExerciseIds(List.of(exerciseId));
        // We make a map of the Evaluations by objective
        Map<String, List<RawEvaluation>> mapEvaluationsByObjective = evaluationRepository.rawByObjectiveIds(
                        rawObjectives.stream()
                                .map(RawObjective::getObjective_id).toList()).stream()
                .collect(Collectors.groupingBy(RawEvaluation::getEvaluation_objective));
        // We make a map of grants of users id by type of grant (Planner, Observer)
        Map<String, List<RawGrant>> rawGrants = grantRepository.rawByExerciseIds(List.of(exerciseId)).stream()
                .collect(Collectors.groupingBy(RawGrant::getGrant_name));
        // We get all the kill chain phases
        List<KillChainPhase> killChainPhase = StreamSupport.stream(
                killChainPhaseRepository.findAllById(
                        rawInjects.stream().flatMap(rawInject -> rawInject.getInject_kill_chain_phases().stream()).toList()
                ).spliterator(), false).collect(Collectors.toList());

        // We create objectives and fill them with evaluations
        List<Objective> objectives = rawObjectives.stream().map(rawObjective -> {
            Objective objective = new Objective();
            if (mapEvaluationsByObjective.get(rawObjective.getObjective_id()) != null) {
                objective.setEvaluations(mapEvaluationsByObjective.get(rawObjective.getObjective_id()).stream().map(
                        rawEvaluation -> {
                            Evaluation evaluation = new Evaluation();
                            evaluation.setId(rawEvaluation.getEvaluation_id());
                            evaluation.setScore(rawEvaluation.getEvaluation_score());
                            return evaluation;
                        }
                ).toList());
            }
            return objective;
        }).toList();

        List<ExerciseTeamUser> listExerciseTeamUsers = listRawExerciseTeamUsers.stream().map(
                ExerciseTeamUser::fromRawExerciseTeamUser
        ).toList();

        // From the raw injects, we recreate Injects with minimal objects for calculations
        List<Inject> injects = rawInjects.stream().map(rawInject -> {
            Inject inject = new Inject();
            if (rawInject.getInject_scenario() != null) {
                inject.setScenario(new Scenario());
                inject.getScenario().setId(rawInject.getInject_scenario());
            }
            // We set the communications
            inject.setCommunications(rawInject.getInject_communications().stream().map(com -> {
                Communication communication = new Communication();
                communication.setId(com);
                return communication;
            }).toList());
            // We set the status too
            if (rawInject.getStatus_name() != null) {
                InjectStatus injectStatus = new InjectStatus();
                injectStatus.setName(ExecutionStatus.valueOf(rawInject.getStatus_name()));
                inject.setStatus(injectStatus);
            }
            // We recreate an exercise out of the raw exercise
            Exercise exercise = new Exercise();
            exercise.setStatus(ExerciseStatus.valueOf(rawExercise.getExercise_status()));
            exercise.setStart(rawExercise.getExercise_start_date());
            exercise.setPauses(
                    // We set the pauses as they are used for calculations
                    pauseRepository.rawAllForExercise(exerciseId).stream().map(rawPause -> {
                        Pause pause = new Pause();
                        pause.setExercise(new Exercise());
                        pause.getExercise().setId(exerciseId);
                        pause.setDate(rawPause.getPause_date());
                        pause.setId(rawPause.getPause_id());
                        pause.setDuration(rawPause.getPause_duration());
                        return pause;
                    }).toList()
            );
            exercise.setCurrentPause(rawExercise.getExercise_pause_date());
            inject.setExercise(exercise);
            return inject;
        }).toList();

        // We create an ExerciseDetails object and populate it
        ExerciseDetails detail = ExerciseDetails.fromRawExercise(rawExercise, injects, listExerciseTeamUsers, objectives);
        detail.setPlatforms(
                rawInjects.stream().flatMap(inject -> inject.getInject_platforms().stream()).distinct().toList());
        detail.setCommunicationsNumber(
                rawInjects.stream().mapToLong(rawInject -> rawInject.getInject_communications().size()).sum());
        detail.setKillChainPhases(killChainPhase);
        if (rawGrants.get(Grant.GRANT_TYPE.OBSERVER.name()) != null) {
            detail.setObservers(rawGrants.get(Grant.GRANT_TYPE.OBSERVER.name()).stream().map(RawGrant::getUser_id)
                    .collect(Collectors.toSet()));
        }
        if (rawGrants.get(Grant.GRANT_TYPE.PLANNER.name()) != null) {
            detail.setPlanners(rawGrants.get(Grant.GRANT_TYPE.PLANNER.name()).stream().map(RawGrant::getUser_id)
                    .collect(Collectors.toSet()));
        }

        return detail;
    }

    @GetMapping(EXERCISE_URI + "/{exerciseId}/results")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public List<ExpectationResultsByType> globalResults(@NotBlank final @PathVariable String exerciseId) {
        return exerciseRepository.findById(exerciseId)
                .map(Exercise::getInjects)
                .map((ResultUtils::computeGlobalExpectationResults))
                .orElseThrow(() -> new RuntimeException("Exercise not found with ID: " + exerciseId));
    }

    @GetMapping(EXERCISE_URI + "/{exerciseId}/injects/results")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public List<InjectExpectationResultsByAttackPattern> injectResults(@NotBlank final @PathVariable String exerciseId) {
        return exerciseRepository.findById(exerciseId)
                .map(Exercise::getInjects)
                .map(ResultUtils::computeInjectExpectationResults)
                .orElseThrow(() -> new RuntimeException("Exercise not found with ID: " + exerciseId));
    }

    @DeleteMapping(EXERCISE_URI + "/{exerciseId}/{documentId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public Exercise deleteDocument(@PathVariable String exerciseId, @PathVariable String documentId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        exercise.setUpdatedAt(now());
        Document doc = documentRepository.findById(documentId).orElseThrow(ElementNotFoundException::new);
        Set<Exercise> docExercises = doc.getExercises().stream().filter(ex -> !ex.getId().equals(exerciseId))
                .collect(Collectors.toSet());
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

    @PutMapping(EXERCISE_URI + "/{exerciseId}/status")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public Exercise changeExerciseStatus(
            @PathVariable String exerciseId,
            @Valid @RequestBody ExerciseUpdateStatusInput input) {
        ExerciseStatus status = input.getStatus();
        Exercise exercise = this.exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        // Check if next status is possible
        List<ExerciseStatus> nextPossibleStatus = exercise.nextPossibleStatus();
        if (!nextPossibleStatus.contains(status)) {
            throw new UnsupportedOperationException("Exercise cant support moving to status " + status.name());
        }
        // In case of rescheduled of an exercise.
        boolean isCloseState =
                ExerciseStatus.CANCELED.equals(exercise.getStatus()) || ExerciseStatus.FINISHED.equals(exercise.getStatus());
        if (isCloseState && ExerciseStatus.SCHEDULED.equals(status)) {
            exercise.setStart(null);
            exercise.setEnd(null);
            // Reset pauses
            exercise.setCurrentPause(null);
            pauseRepository.deleteAll(pauseRepository.findAllForExercise(exerciseId));
            // Reset injects outcome, communications and expectations
            this.injectStatusRepository.deleteAllById(
                    exercise.getInjects()
                            .stream()
                            .map(Inject::getStatus)
                            .map(i -> i.map(InjectStatus::getId).orElse(""))
                            .toList());
            exercise.getInjects().forEach(Inject::clean);
            // Reset lessons learned answers
            List<LessonsAnswer> lessonsAnswers = lessonsCategoryRepository.findAll(
                    LessonsCategorySpecification.fromExercise(exerciseId)).stream().flatMap(
                    lessonsCategory -> lessonsQuestionRepository.findAll(
                            LessonsQuestionSpecification.fromCategory(lessonsCategory.getId())).stream().flatMap(
                            lessonsQuestion -> lessonsAnswerRepository.findAll(
                                    LessonsAnswerSpecification.fromQuestion(lessonsQuestion.getId())).stream())).toList();
            lessonsAnswerRepository.deleteAll(lessonsAnswers);
            // Delete exercise transient files (communications, ...)
            fileService.deleteDirectory(exerciseId);
        }
        // In case of manual start
        if (ExerciseStatus.SCHEDULED.equals(exercise.getStatus()) && ExerciseStatus.RUNNING.equals(status)) {
            Instant nextMinute = now().truncatedTo(MINUTES).plus(1, MINUTES);
            exercise.setStart(nextMinute);
        }
        // If exercise move from pause to running state,
        // we log the pause date to be able to recompute inject dates.
        if (ExerciseStatus.PAUSED.equals(exercise.getStatus()) && ExerciseStatus.RUNNING.equals(status)) {
            Instant lastPause = exercise.getCurrentPause().orElseThrow(ElementNotFoundException::new);
            exercise.setCurrentPause(null);
            Pause pause = new Pause();
            pause.setDate(lastPause);
            pause.setExercise(exercise);
            pause.setDuration(between(lastPause, now()).getSeconds());
            pauseRepository.save(pause);
        }
        // If pause is asked, just set the pause date.
        if (ExerciseStatus.RUNNING.equals(exercise.getStatus()) && ExerciseStatus.PAUSED.equals(status)) {
            exercise.setCurrentPause(Instant.now());
        }
        // Cancelation
        if (ExerciseStatus.RUNNING.equals(exercise.getStatus()) && ExerciseStatus.CANCELED.equals(status)) {
            exercise.setEnd(now());
        }
        exercise.setUpdatedAt(now());
        exercise.setStatus(status);
        return exerciseRepository.save(exercise);
    }

    @GetMapping(EXERCISE_URI)
    public List<ExerciseSimple> exercises() {
        // We get the exercises depending on whether or not we are granted
        Iterable<RawExercise> exercises = currentUser().isAdmin() ? exerciseRepository.rawAll()
                : exerciseRepository.rawAllGranted(currentUser().getId());

        // From the list of exercises, we get the list of the injects ids
        List<String> listOfInjectIds = fromIterable(exercises).stream()
                .filter(exercise -> exercise.getInject_ids() != null)
                .flatMap(exercise -> exercise.getInject_ids().stream())
                .distinct()
                .toList();

        Map<String, Inject> mapOfInjects = this.injectService.mapOfInjects(listOfInjectIds);

        // Finally, for all exercices we got, we convert them to classic exercises with the injects we created
        return fromIterable(exercises).stream().map(currentExercice -> {
            // We make a list out of all the injects that are linked to the exercise
            List<Inject> listOfInjectsOfExercise = new ArrayList<>();
            if (currentExercice.getInject_ids() != null) {
                listOfInjectsOfExercise = currentExercice.getInject_ids().stream().map(mapOfInjects::get)
                        .collect(Collectors.toList());
            }

            // We create a new exercise out of the Raw object
            return ExerciseSimple.fromRawExercise(currentExercice,
                    listOfInjectsOfExercise);
        }).toList();
    }

    @PostMapping(EXERCISE_URI + "/search")
    public Page<ExerciseSimple> exercises(@RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
        if (currentUser().isAdmin()) {
            return buildPaginationCriteriaBuilder(
                this.exerciseService::exercises,
                    searchPaginationInput,
                    Exercise.class
            );
        } else {
            return buildPaginationCriteriaBuilder(
                    (Specification<Exercise> specification, Pageable pageable) -> this.exerciseService.exercises(
                        findGrantedFor(currentUser().getId()).and(specification),
                            pageable
                    ),
                    searchPaginationInput,
                    Exercise.class
            );
        }
    }

    // endregion

    // region communication
    @GetMapping(EXERCISE_URI + "/{exerciseId}/communications")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<Communication> exerciseCommunications(@PathVariable String exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        List<Communication> communications = new ArrayList<>();
        exercise.getInjects().forEach(injectDoc -> communications.addAll(injectDoc.getCommunications()));
        return communications;
    }

    @GetMapping("/api/communications/attachment")
    // @PreAuthorize("isExerciseObserver(#exerciseId)")
    public void downloadAttachment(@RequestParam String file, HttpServletResponse response) throws IOException {
        FileContainer fileContainer = fileService.getFileContainer(file).orElseThrow(ElementNotFoundException::new);
        response.addHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileContainer.getName());
        response.addHeader(HttpHeaders.CONTENT_TYPE, fileContainer.getContentType());
        response.setStatus(HttpServletResponse.SC_OK);
        fileContainer.getInputStream().transferTo(response.getOutputStream());
    }
    // endregion

    // region import/export
    @GetMapping(EXERCISE_URI + "/{exerciseId}/export")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public void exerciseExport(@NotBlank @PathVariable final String exerciseId,
                               @RequestParam(required = false) final boolean isWithTeams,
                               @RequestParam(required = false) final boolean isWithPlayers,
                               @RequestParam(required = false) final boolean isWithVariableValues, HttpServletResponse response)
            throws IOException {
        // Setup the mapper for export
        List<String> documentIds = new ArrayList<>();
        ObjectMapper objectMapper = mapper.copy();
        if (!isWithPlayers) {
            objectMapper.addMixIn(ExerciseFileExport.class, ExerciseExportMixins.ExerciseFileExport.class);
        }
        // Start exporting exercise
        ExerciseFileExport importExport = new ExerciseFileExport();
        importExport.setVersion(1);
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
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
        if (isWithTeams) {
            // Teams
            List<Team> teams = exercise.getTeams();
            importExport.setTeams(teams);
            objectMapper.addMixIn(Team.class,
                    isWithPlayers ? ExerciseExportMixins.Team.class : ExerciseExportMixins.EmptyTeam.class);
            exerciseTags.addAll(teams.stream().flatMap(team -> team.getTags().stream()).toList());
        }
        if (isWithPlayers) {
            // players
            List<User> players = exercise.getTeams().stream().flatMap(team -> team.getUsers().stream()).distinct().toList();
            exerciseTags.addAll(players.stream().flatMap(user -> user.getTags().stream()).toList());
            importExport.setUsers(players);
            objectMapper.addMixIn(User.class, ExerciseExportMixins.User.class);
            // organizations
            List<Organization> organizations = players.stream()
                    .map(User::getOrganization)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();
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
        // Articles / Channels
        List<Article> articles = exercise.getArticles();
        importExport.setArticles(articles);
        objectMapper.addMixIn(Article.class, ExerciseExportMixins.Article.class);
        List<Channel> channels = articles.stream().map(Article::getChannel).distinct().toList();
        documentIds.addAll(channels.stream().flatMap(channel -> channel.getLogos().stream()).map(Document::getId).toList());
        importExport.setChannels(channels);
        objectMapper.addMixIn(Channel.class, ExerciseExportMixins.Channel.class);
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
        List<Variable> variables = this.variableService.variablesFromExercise(exerciseId);
        importExport.setVariables(variables);
        if (isWithVariableValues) {
            objectMapper.addMixIn(Variable.class, VariableWithValueMixin.class);
        } else {
            objectMapper.addMixIn(Variable.class, VariableMixin.class);
        }
        // Build the response
        String infos = "(" +
                (isWithTeams ? "with_teams" : "no_teams") +
                " & " +
                (isWithPlayers ? "with_players" : "no_players") +
                " & " +
                (isWithVariableValues ? "with_variable_values" : "no_variable_values") +
                ")";
        String zipName = (exercise.getName() + "_" + now().toString()) + "_" + infos + ".zip";
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
            Document doc = documentRepository.findById(docId).orElseThrow(ElementNotFoundException::new);
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

    @PostMapping(EXERCISE_URI + "/import")
    @Secured(ROLE_ADMIN)
    public void exerciseImport(@RequestPart("file") MultipartFile file) throws Exception {
        importService.handleFileImport(file);
    }

    // endregion
}
