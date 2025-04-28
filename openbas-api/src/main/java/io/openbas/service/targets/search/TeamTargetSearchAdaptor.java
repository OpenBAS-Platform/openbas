package io.openbas.service.targets.search;

import static io.openbas.database.specification.TeamSpecification.contextual;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectTarget;
import io.openbas.database.model.Team;
import io.openbas.database.model.TeamTarget;
import io.openbas.rest.team.output.TeamOutput;
import io.openbas.service.InjectExpectationService;
import io.openbas.service.TeamService;
import io.openbas.utils.AtomicTestingUtils;
import io.openbas.utils.pagination.SearchPaginationInput;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class TeamTargetSearchAdaptor extends SearchAdaptorBase {
  private final TeamService teamService;
  private final InjectExpectationService injectExpectationService;

  public TeamTargetSearchAdaptor(
      TeamService teamService, InjectExpectationService injectExpectationService) {
    this.teamService = teamService;
    this.injectExpectationService = injectExpectationService;

    // field name translations
    this.fieldTranslations.put("target_name", "team_name");
    this.fieldTranslations.put("target_tags", "team_tags");
    this.fieldTranslations.put("target_injects", "team_injects");
  }

  @Override
  public Page<InjectTarget> search(SearchPaginationInput input, Inject scopedInject) {
    final Specification<Team> teamSpecification = contextual(false);
    Page<TeamOutput> filteredTeams =
        teamService.teamPagination(this.translate(input, scopedInject), teamSpecification);
    return new PageImpl<>(
        filteredTeams.getContent().stream()
            .map(teamOutput -> convertFromTeamOutput(teamOutput, scopedInject))
            .toList(),
        filteredTeams.getPageable(),
        filteredTeams.getTotalElements());
  }

  private InjectTarget convertFromTeamOutput(TeamOutput teamOutput, Inject inject) {
    TeamTarget target =
        new TeamTarget(teamOutput.getId(), teamOutput.getName(), teamOutput.getTags());

    List<AtomicTestingUtils.ExpectationResultsByType> results =
        AtomicTestingUtils.getExpectationResultByTypes(
            injectExpectationService.findExpectationsByInjectAndTargetAndTargetType(
                inject.getId(), target.getId(), "not applicable", target.getTargetType()));

    for (AtomicTestingUtils.ExpectationResultsByType result : results) {
      switch (result.type()) {
        case DETECTION -> target.setTargetDetectionStatus(result.avgResult());
        case PREVENTION -> target.setTargetPreventionStatus(result.avgResult());
        case HUMAN_RESPONSE -> target.setTargetHumanResponseStatus(result.avgResult());
      }
    }

    return target;
  }
}
