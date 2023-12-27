package io.openex.rest.team;

import io.openex.database.model.Team;
import io.openex.database.model.Exercise;
import io.openex.database.model.User;
import io.openex.database.repository.TeamRepository;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.TagRepository;
import io.openex.database.repository.UserRepository;
import io.openex.rest.team.form.TeamCreateInput;
import io.openex.rest.team.form.TeamUpdateActivationInput;
import io.openex.rest.team.form.TeamUpdateInput;
import io.openex.rest.team.form.UpdateUsersTeamInput;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;

import static io.openex.database.model.User.ROLE_USER;
import static io.openex.helper.StreamHelper.fromIterable;
import static java.time.Instant.now;

@RestController
@RolesAllowed(ROLE_USER)
public class TeamApi extends RestBehavior {

    private ExerciseRepository exerciseRepository;
    private TeamRepository teamRepository;
    private UserRepository userRepository;
    private TagRepository tagRepository;

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Autowired
    public void setTeamRepository(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @GetMapping("/api/teams")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<Team> getTeams(@PathVariable String exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        return exercise.getTeams();
    }

    @GetMapping("/api/teams/{teamId}")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Team getTeam(@PathVariable String exerciseId, @PathVariable String teamId) {
        return teamRepository.findById(teamId).orElseThrow();
    }

    @GetMapping("/api/teams/{teamId}/players")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<User> getTeamPlayers(@PathVariable String exerciseId, @PathVariable String teamId) {
        return teamRepository.findById(teamId).orElseThrow().getUsers();
    }

    @PostMapping("/api/teams")
    public Team createTeam(@Valid @RequestBody TeamCreateInput input) {
        Team team = new Team();
        team.setUpdateAttributes(input);
        team.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        return teamRepository.save(team);
    }

    @DeleteMapping("/api/teams/{teamId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public void deleteTeam(@PathVariable String teamId) {
        teamRepository.deleteById(teamId);
    }

    @PutMapping("/api/teams/{teamId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Team updateTeam(@PathVariable String teamId,
                           @Valid @RequestBody TeamUpdateInput input) {
        Team team = teamRepository.findById(teamId).orElseThrow();
        team.setUpdateAttributes(input);
        team.setUpdatedAt(now());
        team.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        return teamRepository.save(team);
    }

    @PutMapping("/api/teams/{teamId}/players")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Team updateTeamUsers(
            @PathVariable String exerciseId,
            @PathVariable String teamId,
            @Valid @RequestBody UpdateUsersTeamInput input) {
        Team team = teamRepository.findById(teamId).orElseThrow();
        Iterable<User> teamUsers = userRepository.findAllById(input.getUserIds());
        team.setUsers(fromIterable(teamUsers));
        return teamRepository.save(team);
    }

    @PutMapping("/api/teams/{teamId}/activation")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Team updateTeamActivation(
            @PathVariable String exerciseId,
            @PathVariable String teamId,
            @Valid @RequestBody TeamUpdateActivationInput input) {
        Team team = teamRepository.findById(teamId).orElseThrow();
        team.setEnabled(input.isEnabled());
        return teamRepository.save(team);
    }
}
