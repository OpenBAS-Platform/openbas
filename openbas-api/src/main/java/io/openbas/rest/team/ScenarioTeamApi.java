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
import org.springframework.web.bind.annotation.*;

import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.database.specification.TeamSpecification.*;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;

@RequiredArgsConstructor
@RestController
@Secured(ROLE_USER)
public class ScenarioTeamApi extends RestBehavior {

  private final TeamService teamService;

  @PostMapping(SCENARIO_URI + "/{scenarioId}/teams/search")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  @Transactional(readOnly = true)
  @Tracing(name = "Paginate teams for scenario", layer = "api", operation = "POST")
  public Page<TeamOutput> teams(
      @PathVariable @NotBlank final String scenarioId,
      @RequestBody @Valid SearchPaginationInput searchPaginationInput,
      @RequestParam final boolean contextualOnly) {
    Specification<Team> teamSpecification;
    if (!contextualOnly) {
      teamSpecification = contextual(false).or(fromScenario(scenarioId).and(contextual(true)));
    } else {
      teamSpecification = fromScenario(scenarioId);
    }
    return this.teamService.teamPagination(searchPaginationInput, teamSpecification);
  }

}
