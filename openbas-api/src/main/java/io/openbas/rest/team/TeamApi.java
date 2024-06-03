package io.openbas.rest.team;

import io.openbas.config.OpenBASPrincipal;
import io.openbas.database.model.*;
import io.openbas.database.raw.*;
import io.openbas.database.repository.*;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.team.form.TeamCreateInput;
import io.openbas.rest.team.form.TeamUpdateInput;
import io.openbas.rest.team.form.UpdateUsersTeamInput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Collectors;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.database.specification.TeamSpecification.contextual;
import static io.openbas.database.specification.TeamSpecification.teamsAccessibleFromOrganizations;
import static io.openbas.helper.DatabaseHelper.updateRelation;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;
import static java.time.Instant.now;

@RestController
@Secured(ROLE_USER)
public class TeamApi extends RestBehavior {

    private ExerciseRepository exerciseRepository;
    private ScenarioRepository scenarioRepository;
    private TeamRepository teamRepository;
    private CommunicationRepository communicationRepository;
    private InjectExpectationRepository injectExpectationRepository;
    private UserRepository userRepository;
    private OrganizationRepository organizationRepository;
    private TagRepository tagRepository;
    private ExerciseTeamUserRepository exerciseTeamUserRepository;

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Autowired
    public void setScenarioRepository(ScenarioRepository scenarioRepository) {
        this.scenarioRepository = scenarioRepository;
    }

    @Autowired
    public void setTeamRepository(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setOrganizationRepository(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @Autowired
    public void setInjectExpectationRepository(InjectExpectationRepository injectExpectationRepository) {
        this.injectExpectationRepository = injectExpectationRepository;
    }

    @Autowired
    public void setCommunicationRepository(CommunicationRepository communicationRepository) {
        this.communicationRepository = communicationRepository;
    }

    @Autowired
    public void setExerciseTeamUserRepository(ExerciseTeamUserRepository exerciseTeamUserRepository) {
        this.exerciseTeamUserRepository = exerciseTeamUserRepository;
    }

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @GetMapping("/api/teams")
    @PreAuthorize("isObserver()")
    public Iterable<SimplerTeam> getTeams() {
        List<RawTeam> teams;
        OpenBASPrincipal currentUser = currentUser();
        if (currentUser.isAdmin()) {
            //We get all the teams as raw
            teams = fromIterable(teamRepository.rawTeams());
        } else {
            //We get the teams that are linked to the oragnizations we are part of
            User local = userRepository.findById(currentUser.getId()).orElseThrow(ElementNotFoundException::new);
            List<String> organizationIds = local.getGroups().stream()
                    .flatMap(group -> group.getOrganizations().stream())
                    .map(Organization::getId)
                    .toList();
            teams = teamRepository.rawTeamsAccessibleFromOrganization(organizationIds);
        }

        // Getting a map of inject expectations
        Map<String, RawInjectExpectation> mapInjectExpectation = injectExpectationRepository.rawByIds(
                        teams.stream().flatMap(rawTeam -> rawTeam.getTeam_expectations().stream()).toList()
                )
                .stream().collect(Collectors.toMap(RawInjectExpectation::getInject_expectation_id, Function.identity()));

        // Getting a map of communications
        Map<String, RawCommunication> mapCommunication = communicationRepository.rawByIds(
                        teams.stream().flatMap(rawTeam -> rawTeam.getTeam_communications().stream()).toList()
                )
                .stream().collect(Collectors.toMap(RawCommunication::getCommunication_id, Function.identity()));

        // Getting a map of exercises team users by team id
        Map<String, List<RawExerciseTeamUser>> mapExerciseTeamUser = exerciseTeamUserRepository.rawByTeamIds(
                        teams.stream().map(RawTeam::getTeam_id).toList()
                )
                .stream().collect(Collectors.groupingBy(RawExerciseTeamUser::getTeam_id));

        // Getting a map of Injects by scenarios ids
        Map<String, Set<String>> mapInjectsByScenarioIds = scenarioRepository.rawInjectsFromScenarios(
                        teams.stream().flatMap(rawTeam -> rawTeam.getTeam_scenarios().stream()).toList()
                ).stream().collect(Collectors.toMap(RawScenario::getScenario_id, RawScenario::getScenario_injects));

        // Then, for all the raw teams, we will create a simpler team object and then send it back to the front
        List<SimplerTeam> resultTeams = teams.stream().map(rawTeam -> {
            // We create the simpler team object using the raw one
            SimplerTeam simplerTeam = new SimplerTeam(rawTeam);

            // We set the inject expectations
            simplerTeam.setInjectExpectations(
                    rawTeam.getTeam_expectations().stream().map(
                            expectation -> {
                                // We set the inject expectation using the map we generated earlier
                                RawInjectExpectation raw = mapInjectExpectation.get(expectation);
                                InjectExpectation injectExpectation = new InjectExpectation();
                                injectExpectation.setScore(raw.getInject_expectation_score());
                                injectExpectation.setId(raw.getInject_expectation_id());
                                injectExpectation.setExpectedScore(raw.getInject_expectation_expected_score());
                                if(raw.getExercise_id() != null) {
                                    injectExpectation.setExercise(new Exercise());
                                    injectExpectation.getExercise().setId(raw.getExercise_id());
                                }
                                injectExpectation.setTeam(new Team());
                                injectExpectation.getTeam().setId(rawTeam.getTeam_id());
                                injectExpectation.setType(InjectExpectation.EXPECTATION_TYPE.valueOf(raw.getInject_expectation_type()));
                                return injectExpectation;
                            }
                    ).toList()
            );

            // We set the communications using the map we generated earlier
            // This object has content, content_html and attachments ignored because WE DON'T WANT THE FULL EXTENT
            simplerTeam.setCommunications(
                rawTeam.getTeam_communications().stream().map(communicationId -> {
                    RawCommunication raw = mapCommunication.get(communicationId);
                    Communication communication = new Communication();
                    communication.setAck(raw.getCommunication_ack());
                    communication.setId(raw.getCommunication_id());
                    communication.setIdentifier(raw.getCommunication_message_id());
                    communication.setReceivedAt(raw.getCommunication_received_at());
                    communication.setSentAt(raw.getCommunication_sent_at());
                    communication.setSubject(raw.getCommunication_subject());
                    Inject inject = new Inject();
                    inject.setId(raw.getCommunication_inject());
                    Exercise exercise = new Exercise();
                    exercise.setId(raw.getCommunication_exercise());
                    inject.setExercise(exercise);
                    communication.setInject(inject);
                    communication.setUsers(raw.getCommunication_users().stream().map(id -> {
                        User user = new User();
                        user.setId(id);
                        return user;
                    }).toList());
                    communication.setAnimation(raw.getCommunication_animation());
                    communication.setFrom(raw.getCommunication_from());
                    communication.setTo(raw.getCommunication_to());
                    return communication;
                }).toList()
            );

            // We set the tuple of exercise/user/team
            List<RawExerciseTeamUser> exerciseTeamUsers = mapExerciseTeamUser.get(rawTeam);
            if(exerciseTeamUsers != null) {
                simplerTeam.setExerciseTeamUsers(exerciseTeamUsers.stream().map(
                        rawExerciseTeamUser -> {
                            ExerciseTeamUser exerciseTeamUser = new ExerciseTeamUser();
                            exerciseTeamUser.setTeam(new Team());
                            exerciseTeamUser.getTeam().setId(rawExerciseTeamUser.getTeam_id());
                            exerciseTeamUser.setExercise(new Exercise());
                            exerciseTeamUser.getExercise().setId(rawExerciseTeamUser.getExercise_id());
                            exerciseTeamUser.setUser(new User());
                            exerciseTeamUser.getUser().setId(rawExerciseTeamUser.getUser_id());
                            return exerciseTeamUser;
                        }
                ).collect(Collectors.toSet()));
            }

            // We set the injects linked to the scenarios
            simplerTeam.setScenariosInjects(rawTeam.getTeam_scenarios().stream().flatMap(
                    scenario -> mapInjectsByScenarioIds.get(scenario).stream()
            ).collect(Collectors.toSet()));

            return simplerTeam;
        }).collect(Collectors.toList());

        return resultTeams;
    }

    @PostMapping("/api/teams/search")
    @PreAuthorize("isObserver()")
    public Page<RawPaginationTeam> teams(@RequestBody @Valid SearchPaginationInput searchPaginationInput) {
        BiFunction<Specification<Team>, Pageable, Page<Team>> teamsFunction;
        OpenBASPrincipal currentUser = currentUser();
        if (currentUser.isAdmin()) {
            teamsFunction = (Specification<Team> specification, Pageable pageable) -> this.teamRepository
                    .findAll(contextual(false).and(specification), pageable);
        } else {
            User local = this.userRepository.findById(currentUser.getId()).orElseThrow(ElementNotFoundException::new);
            List<String> organizationIds = local.getGroups().stream()
                    .flatMap(group -> group.getOrganizations().stream())
                    .map(Organization::getId)
                    .toList();
            teamsFunction = (Specification<Team> specification, Pageable pageable) -> this.teamRepository
                    .findAll(contextual(false).and(teamsAccessibleFromOrganizations(organizationIds).and(specification)), pageable);
        }
        return buildPaginationJPA(
                teamsFunction,
                searchPaginationInput,
                Team.class
        ).map(RawPaginationTeam::new);
    }

    @GetMapping("/api/teams/{teamId}")
    @PreAuthorize("isObserver()")
    public Team getTeam(@PathVariable String teamId) {
        return teamRepository.findById(teamId).orElseThrow(ElementNotFoundException::new);
    }

    @GetMapping("/api/teams/{teamId}/players")
    @PreAuthorize("isObserver()")
    public Iterable<User> getTeamPlayers(@PathVariable String teamId) {
        return teamRepository.findById(teamId).orElseThrow(ElementNotFoundException::new).getUsers();
    }

    @PostMapping("/api/teams")
    @PreAuthorize("isPlanner()")
    @Transactional(rollbackOn = Exception.class)
    public Team createTeam(@Valid @RequestBody TeamCreateInput input) {
        if (input.getContextual() && input.getExerciseIds().toArray().length > 1) {
            throw new UnsupportedOperationException("Contextual team can only be associated to one exercise");
        }
        Optional<Team> existingTeam = teamRepository.findByName(input.getName());
        if (existingTeam.isPresent() && !input.getContextual()) {
            throw new UnsupportedOperationException("Global teams (non contextual) cannot have the same name (already exists)");
        }
        Team team = new Team();
        team.setUpdateAttributes(input);
        team.setOrganization(updateRelation(input.getOrganizationId(), team.getOrganization(), organizationRepository));
        team.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        team.setExercises(fromIterable(exerciseRepository.findAllById(input.getExerciseIds())));
        team.setScenarios(fromIterable(scenarioRepository.findAllById(input.getScenarioIds())));
        return teamRepository.save(team);
    }

    @PostMapping("/api/teams/upsert")
    @PreAuthorize("isPlanner()")
    @Transactional(rollbackOn = Exception.class)
    public Team upsertTeam(@Valid @RequestBody TeamCreateInput input) {
        if (input.getContextual() && input.getExerciseIds().toArray().length > 1) {
            throw new UnsupportedOperationException("Contextual team can only be associated to one exercise");
        }
        Optional<Team> team = teamRepository.findByName(input.getName());
        if (team.isPresent()) {
            Team existingTeam = team.get();
            existingTeam.setUpdateAttributes(input);
            existingTeam.setUpdatedAt(now());
            existingTeam.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
            existingTeam.setOrganization(updateRelation(input.getOrganizationId(), existingTeam.getOrganization(), organizationRepository));
            return teamRepository.save(existingTeam);
        } else {
            Team newTeam = new Team();
            newTeam.setUpdateAttributes(input);
            newTeam.setOrganization(updateRelation(input.getOrganizationId(), newTeam.getOrganization(), organizationRepository));
            newTeam.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
            newTeam.setExercises(fromIterable(exerciseRepository.findAllById(input.getExerciseIds())));
            newTeam.setScenarios(fromIterable(scenarioRepository.findAllById(input.getScenarioIds())));
            return teamRepository.save(newTeam);
        }
    }

    @DeleteMapping("/api/teams/{teamId}")
    @PreAuthorize("isPlanner()")
    public void deleteTeam(@PathVariable String teamId) {
        teamRepository.deleteById(teamId);
    }

    @PutMapping("/api/teams/{teamId}")
    @PreAuthorize("isPlanner()")
    public Team updateTeam(@PathVariable String teamId, @Valid @RequestBody TeamUpdateInput input) {
        Team team = teamRepository.findById(teamId).orElseThrow(ElementNotFoundException::new);
        team.setUpdateAttributes(input);
        team.setUpdatedAt(now());
        team.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        team.setOrganization(updateRelation(input.getOrganizationId(), team.getOrganization(), organizationRepository));
        return teamRepository.save(team);
    }

    @PutMapping("/api/teams/{teamId}/players")
    @PreAuthorize("isPlanner()")
    public Team updateTeamUsers(@PathVariable String teamId, @Valid @RequestBody UpdateUsersTeamInput input) {
        Team team = teamRepository.findById(teamId).orElseThrow(ElementNotFoundException::new);
        Iterable<User> teamUsers = userRepository.findAllById(input.getUserIds());
        team.setUsers(fromIterable(teamUsers));
        return teamRepository.save(team);
    }
}
