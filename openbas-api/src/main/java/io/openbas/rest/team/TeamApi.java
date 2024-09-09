package io.openbas.rest.team;

import io.openbas.config.OpenBASPrincipal;
import io.openbas.database.model.Organization;
import io.openbas.database.model.Team;
import io.openbas.database.model.TeamSimple;
import io.openbas.database.model.User;
import io.openbas.database.raw.RawPaginationTeam;
import io.openbas.database.raw.RawTeam;
import io.openbas.database.repository.*;
import io.openbas.rest.exception.AlreadyExistingException;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.helper.TeamHelper;
import io.openbas.rest.team.form.TeamCreateInput;
import io.openbas.rest.team.form.TeamUpdateInput;
import io.openbas.rest.team.form.UpdateUsersTeamInput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.function.BiFunction;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.database.specification.TeamSpecification.contextual;
import static io.openbas.database.specification.TeamSpecification.teamsAccessibleFromOrganizations;
import static io.openbas.helper.DatabaseHelper.updateRelation;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;
import static java.lang.Boolean.FALSE;
import static java.lang.Boolean.TRUE;
import static java.time.Instant.now;
import static org.springframework.util.StringUtils.hasText;

@RestController
@Secured(ROLE_USER)
public class TeamApi extends RestBehavior {

    private ExerciseRepository exerciseRepository;
    private ScenarioRepository scenarioRepository;
    private TeamRepository teamRepository;
    private CommunicationRepository communicationRepository;
    private InjectExpectationRepository injectExpectationRepository;
    private InjectRepository injectRepository;
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
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
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
    public Iterable<TeamSimple> getTeams() {
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

        return TeamHelper.rawTeamToSimplerTeam(teams, injectExpectationRepository, injectRepository, communicationRepository,
                exerciseTeamUserRepository, scenarioRepository);
    }

    @PostMapping("/api/teams/search")
    @PreAuthorize("isObserver()")
    @Transactional(readOnly = true)
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
    @Transactional(rollbackFor = Exception.class)
    public Team createTeam(@Valid @RequestBody TeamCreateInput input) {
        isTeamAlreadyExists(input);
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
    @Transactional(rollbackFor = Exception.class)
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

    // -- PRIVATE --

    private void isTeamAlreadyExists(@NotNull final TeamCreateInput input) {
        List<Team> teams = this.teamRepository.findAllByNameIgnoreCase(input.getName());
        if (teams.isEmpty()) return;

        if (FALSE.equals(input.getContextual()) && teams.stream().anyMatch(t -> FALSE.equals(t.getContextual()))) {
            throw new AlreadyExistingException("Global teams (non contextual) cannot have the same name (already exists)");
        }
        if (TRUE.equals(input.getContextual())) {
            String exerciseId = input.getExerciseIds().stream().findFirst().orElse(null);
            if (hasText(exerciseId) && teams.stream().anyMatch(t -> TRUE.equals(t.getContextual()) && t.getExercises().stream().anyMatch((e) -> exerciseId.equals(e.getId())))) {
                throw new AlreadyExistingException("A contextual team with the same name already exists on this simulation");
            }
            String scenarioId = input.getScenarioIds().stream().findFirst().orElse(null);
            if (hasText(scenarioId) && teams.stream().anyMatch(t -> TRUE.equals(t.getContextual()) && t.getScenarios().stream().anyMatch((e) -> scenarioId.equals(e.getId())))) {
                throw new AlreadyExistingException("A contextual team with the same name already exists on this scenario");
            }
        }

    }
}
