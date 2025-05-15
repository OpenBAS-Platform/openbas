package io.openbas.service.targets.search;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.*;
import io.openbas.database.repository.TeamRepository;
import io.openbas.service.InjectExpectationService;
import io.openbas.service.TeamService;
import io.openbas.utils.AtomicTestingUtils;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.persistence.criteria.Path;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class TeamTargetSearchAdaptor extends SearchAdaptorBase {
  private final TeamService teamService;
  private final TeamRepository teamRepository;
  private final InjectExpectationService injectExpectationService;

  public TeamTargetSearchAdaptor(
      TeamService teamService,
      TeamRepository teamRepository,
      InjectExpectationService injectExpectationService) {
    this.teamService = teamService;
    this.teamRepository = teamRepository;
    this.injectExpectationService = injectExpectationService;

    // field name translations
    this.fieldTranslations.put("target_name", "team_name");
    this.fieldTranslations.put("target_tags", "team_tags");
  }

  private static Specification<Team> teamsSpecificationFromInject(Inject scopedInject) {
    return (root, query, builder) -> {
      if (scopedInject.isAtomicTesting()) {
        Path<Object> injectPath = root.join("injects").get("id");
        return builder.equal(injectPath, scopedInject.getId());
      } else {
        if (scopedInject.isAllTeams()) {
          Path<Object> exerciseTeamUsersPath =
              root.get("exerciseTeamUsers").get("exercise").get("id");
          Path<Object> injectPath = root.join("exercises").get("injects").get("id");
          return builder.and(
              builder.equal(injectPath, scopedInject.getId()),
              builder.equal(exerciseTeamUsersPath, scopedInject.getExercise().getId()));
        } else {
          Path<Object> exerciseTeamUsersPath =
              root.get("exerciseTeamUsers").get("exercise").get("id");
          Path<Object> injectPath = root.join("injects").get("id");
          return builder.and(
              builder.equal(injectPath, scopedInject.getId()),
              builder.equal(exerciseTeamUsersPath, scopedInject.getExercise().getId()));
        }
      }
    };
  }

  @Override
  public Page<InjectTarget> search(SearchPaginationInput input, Inject scopedInject) {
    SearchPaginationInput translatedInput = this.translate(input, scopedInject);

    Page<Team> filteredTeams =
        buildPaginationJPA(
            (Specification<Team> specification, Pageable pageable) ->
                this.teamRepository.findAll(
                    teamsSpecificationFromInject(scopedInject).and(specification), pageable),
            translatedInput,
            Team.class);

    return new PageImpl<>(
        filteredTeams.getContent().stream()
            .map(team -> convertFromTeamOutput(team, scopedInject))
            .toList(),
        filteredTeams.getPageable(),
        filteredTeams.getTotalElements());
  }

  @Override
  public List<FilterUtilsJpa.Option> getOptionsForInject(Inject scopedInject, String textSearch) {
    if (scopedInject.isAllTeams()) {
      return scopedInject.getExercise().getTeams().stream()
          .filter(team -> team.getName().toLowerCase().contains(textSearch.toLowerCase()))
          .map(team -> new FilterUtilsJpa.Option(team.getId(), team.getName()))
          .toList();
    } else {
      return scopedInject.getTeams().stream()
          .filter(team -> team.getName().toLowerCase().contains(textSearch.toLowerCase()))
          .map(team -> new FilterUtilsJpa.Option(team.getId(), team.getName()))
          .toList();
    }
  }

  @Override
  public List<FilterUtilsJpa.Option> getOptionsByIds(List<String> ids) {
    return teamService.getTeams(ids).stream()
        .map(team -> new FilterUtilsJpa.Option(team.getId(), team.getName()))
        .toList();
  }

  private InjectTarget convertFromTeamOutput(Team team, Inject inject) {
    TeamTarget target =
        new TeamTarget(
            team.getId(),
            team.getName(),
            team.getTags().stream().map(Tag::getId).collect(Collectors.toSet()));

    List<AtomicTestingUtils.ExpectationResultsByType> results =
        AtomicTestingUtils.getExpectationResultByTypes(
            injectExpectationService.findMergedExpectationsByInjectAndTargetAndTargetType(
                inject.getId(), target.getId(), target.getTargetType()));

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
