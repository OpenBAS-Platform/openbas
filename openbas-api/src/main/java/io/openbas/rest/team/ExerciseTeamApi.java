package io.openbas.rest.team;

import io.openbas.database.model.Team;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.team.output.TeamOutput;
import io.openbas.service.TeamService;
import io.openbas.telemetry.Tracing;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.database.specification.TeamSpecification.contextual;
import static io.openbas.database.specification.TeamSpecification.fromExercise;
import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;

@RequiredArgsConstructor
@RestController
@Secured(ROLE_USER)
public class ExerciseTeamApi extends RestBehavior {

  private final TeamService teamService;

  @PostMapping(EXERCISE_URI + "/{exerciseId}/teams/search")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  @Transactional(readOnly = true)
  @Tracing(name = "Paginate teams for exercise", layer = "api", operation = "POST")
  public Page<TeamOutput> searchTeams(
      @PathVariable @NotBlank final String exerciseId,
      @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    final Specification<Team> teamSpecification = contextual(false).or(fromExercise(exerciseId).and(contextual(true)));
    return this.teamService.teamPagination(searchPaginationInput, teamSpecification);
  }

}
