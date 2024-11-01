package io.openbas.rest.team;

import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.database.specification.TeamSpecification.contextual;
import static io.openbas.rest.atomic_testing.AtomicTestingApi.ATOMIC_TESTING_URI;

import io.openbas.database.model.Team;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.team.output.TeamOutput;
import io.openbas.service.TeamService;
import io.openbas.telemetry.Tracing;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@Secured(ROLE_USER)
public class AtomicTestingTeamApi extends RestBehavior {

  private final TeamService teamService;

  @PostMapping(ATOMIC_TESTING_URI + "/teams/search")
  @Transactional(readOnly = true)
  @Tracing(name = "Paginate teams for atomic testings", layer = "api", operation = "POST")
  public Page<TeamOutput> searchTeams(
      @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    final Specification<Team> teamSpecification = contextual(false);
    return this.teamService.teamPagination(searchPaginationInput, teamSpecification);
  }
}
