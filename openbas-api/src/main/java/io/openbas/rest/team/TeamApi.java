package io.openbas.rest.team;

import io.openbas.config.OpenBASPrincipal;
import io.openbas.database.model.Organization;
import io.openbas.database.model.Team;
import io.openbas.database.model.User;
import io.openbas.database.repository.*;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.team.form.TeamCreateInput;
import io.openbas.rest.team.form.TeamUpdateInput;
import io.openbas.rest.team.form.UpdateUsersTeamInput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
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
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;
import static java.time.Instant.now;

@RestController
@Secured(ROLE_USER)
public class TeamApi extends RestBehavior {

    private ExerciseRepository exerciseRepository;
    private ScenarioRepository scenarioRepository;
    private TeamRepository teamRepository;
    private UserRepository userRepository;
    private OrganizationRepository organizationRepository;
    private TagRepository tagRepository;

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
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @GetMapping("/api/teams")
    @PreAuthorize("isObserver()")
    public Iterable<Team> getTeams() {
        List<Team> teams;
        OpenBASPrincipal currentUser = currentUser();
        if (currentUser.isAdmin()) {
            teams = fromIterable(teamRepository.findAll());
        } else {
            User local = userRepository.findById(currentUser.getId()).orElseThrow(ElementNotFoundException::new);
            List<String> organizationIds = local.getGroups().stream()
                    .flatMap(group -> group.getOrganizations().stream())
                    .map(Organization::getId)
                    .toList();
            teams = teamRepository.teamsAccessibleFromOrganizations(organizationIds);
        }
        return teams;
    }

    @PostMapping("/api/teams/search")
    @PreAuthorize("isObserver()")
    public Page<Team> teams(@RequestBody @Valid SearchPaginationInput searchPaginationInput) {
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
        );
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
        team.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        team.setExercises(fromIterable(exerciseRepository.findAllById(input.getExerciseIds())));
        team.setScenarios(fromIterable(scenarioRepository.findAllById(input.getScenarioIds())));
        return teamRepository.save(team);
    }

    @PostMapping("/api/teams/upsert")
    @PreAuthorize("isPlanner()")
    public Team upsertTeam(@Valid @RequestBody TeamCreateInput input) {
        if (input.getContextual() && input.getExerciseIds().toArray().length > 1) {
            throw new UnsupportedOperationException("Contextual team can only be associated to one exercise");
        }
        Optional<Team> team = teamRepository.findByName(input.getName());
        if (team.isPresent()) {
            Team existingTeam = team.get();
            existingTeam.setUpdateAttributes(input);
            existingTeam.setUpdatedAt(now());
            existingTeam.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
            existingTeam.setOrganization(updateRelation(input.getOrganizationId(), existingTeam.getOrganization(), organizationRepository));
            return teamRepository.save(existingTeam);
        } else {
            Team newTeam = new Team();
            newTeam.setUpdateAttributes(input);
            newTeam.setOrganization(updateRelation(input.getOrganizationId(), newTeam.getOrganization(), organizationRepository));
            newTeam.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
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
        team.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
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
