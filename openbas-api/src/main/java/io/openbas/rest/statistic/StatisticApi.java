package io.openbas.rest.statistic;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.AtomicTestingUtils.getExpectationResultByTypesFromRaw;
import static java.util.stream.Collectors.groupingBy;

import io.openbas.config.OpenBASPrincipal;
import io.openbas.database.model.AttackPattern;
import io.openbas.database.raw.RawGlobalInjectExpectation;
import io.openbas.database.raw.RawInjectExpectation;
import io.openbas.database.raw.impl.SimpleRawInjectExpectation;
import io.openbas.database.repository.*;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.form.InjectExpectationResultsByAttackPattern;
import io.openbas.rest.statistic.response.PlatformStatistic;
import io.openbas.rest.statistic.response.StatisticElement;
import io.openbas.utils.AtomicTestingMapper.ExpectationResultsByType;
import io.openbas.utils.AtomicTestingUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class StatisticApi extends RestBehavior {

  private final ScenarioRepository scenarioRepository;
  private final ExerciseRepository exerciseRepository;
  private final UserRepository userRepository;
  private final TeamRepository teamRepository;
  private final EndpointRepository endpointRepository;
  private final AssetGroupRepository assetGroupRepository;
  private final InjectRepository injectRepository;

  @GetMapping("/api/statistics")
  @Transactional(rollbackOn = Exception.class)
  @Operation(summary = "Retrieve platform statistics")
  @ApiResponse(
      responseCode = "200",
      description = "Successful operation",
      content = {
        @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = PlatformStatistic.class))
      })
  public PlatformStatistic platformStatistic() {
    Instant now = Instant.now();
    PlatformStatistic statistic = new PlatformStatistic();
    if (currentUser().isAdmin()) {
      statistic.setScenariosCount(computeGlobalStat(now, scenarioRepository));
      statistic.setExercisesCount(computeGlobalStat(now, exerciseRepository));
      statistic.setUsersCount(computeGlobalStat(now, userRepository));
      statistic.setTeamsCount(computeGlobalStat(now, teamRepository));
      statistic.setAssetsCount(computeGlobalStat(now, endpointRepository));
      statistic.setAssetGroupsCount(computeGlobalStat(now, assetGroupRepository));
      statistic.setInjectsCount(computeGlobalStat(now, injectRepository));
      statistic.setResults(computeGlobalExpectationResults(now));
      statistic.setInjectResults(computeGlobalInjectExpectationResults(now));
    } else {
      statistic.setScenariosCount(computeUserStat(now, scenarioRepository));
      statistic.setExercisesCount(computeUserStat(now, exerciseRepository));
      statistic.setUsersCount(computeUserStat(now, userRepository));
      statistic.setTeamsCount(computeUserStat(now, teamRepository));
      statistic.setAssetsCount(computeUserStat(now, endpointRepository));
      statistic.setAssetGroupsCount(computeUserStat(now, assetGroupRepository));
      statistic.setInjectsCount(computeUserStat(now, injectRepository));
      statistic.setResults(computeUserExpectationResults(now));
      statistic.setInjectResults(computeUserInjectExpectationResults(now));
    }
    return statistic;
  }

  // -- GLOBAL STATISTIC --

  private StatisticElement computeGlobalStat(Instant from, StatisticRepository repository) {
    long global = repository.globalCount(from);
    Instant minusMonth = from.minus(30, ChronoUnit.DAYS);
    long progression = global - repository.globalCount(minusMonth);
    return new StatisticElement(global, progression);
  }

  private StatisticElement computeUserStat(Instant from, StatisticRepository repository) {
    OpenBASPrincipal user = currentUser();
    long global = repository.userCount(user.getId(), from);
    Instant minusMonth = from.minus(30, ChronoUnit.DAYS);
    long progression = global - repository.userCount(user.getId(), minusMonth);
    return new StatisticElement(global, progression);
  }

  private List<ExpectationResultsByType> computeGlobalExpectationResults(
      @NotNull final Instant from) {
    List<RawInjectExpectation> rawInjectExpectations =
        fromIterable(this.exerciseRepository.allInjectExpectationsFromDate(from));
    return getExpectationResultByTypesFromRaw(rawInjectExpectations);
  }

  private List<ExpectationResultsByType> computeUserExpectationResults(
      @NotNull final Instant from) {
    OpenBASPrincipal user = currentUser();
    List<RawInjectExpectation> rawInjectExpectations =
        fromIterable(
            this.exerciseRepository.allGrantedInjectExpectationsFromDate(from, user.getId()));
    return getExpectationResultByTypesFromRaw(rawInjectExpectations);
  }

  private List<InjectExpectationResultsByAttackPattern> computeGlobalInjectExpectationResults(
      @NotNull final Instant from) {
    List<RawGlobalInjectExpectation> rawGlobalInjectExpectations =
        fromIterable(this.exerciseRepository.rawGlobalInjectExpectationResultsFromDate(from));
    return injectExpectationResultsByAttackPatternFromRawGlobalInjectExpectation(
        rawGlobalInjectExpectations);
  }

  private List<InjectExpectationResultsByAttackPattern> computeUserInjectExpectationResults(
      @NotNull final Instant from) {
    OpenBASPrincipal user = currentUser();
    List<RawGlobalInjectExpectation> rawGlobalInjectExpectations =
        fromIterable(
            this.exerciseRepository.rawGrantedInjectExpectationResultsFromDate(from, user.getId()));
    return injectExpectationResultsByAttackPatternFromRawGlobalInjectExpectation(
        rawGlobalInjectExpectations);
  }

  private List<InjectExpectationResultsByAttackPattern>
      injectExpectationResultsByAttackPatternFromRawGlobalInjectExpectation(
          List<RawGlobalInjectExpectation> rawGlobalInjectExpectations) {
    return rawGlobalInjectExpectations.stream()
        .map(RawGlobalInjectExpectation::getAttack_pattern_id)
        .distinct()
        .map(
            attackPatternId -> {
              InjectExpectationResultsByAttackPattern resultExpectation =
                  new InjectExpectationResultsByAttackPattern();
              resultExpectation.setAttackPattern(new AttackPattern());
              resultExpectation.getAttackPattern().setId(attackPatternId);

              Map<String, Map<String, List<RawGlobalInjectExpectation>>>
                  rawGlobalInjectExpectationsGroupByAttackAndInjectId =
                      rawGlobalInjectExpectations.stream()
                          .collect(
                              groupingBy(
                                  RawGlobalInjectExpectation::getAttack_pattern_id,
                                  groupingBy(RawGlobalInjectExpectation::getInject_id)));

              List<InjectExpectationResultsByAttackPattern.InjectExpectationResultsByType> results =
                  new ArrayList<>();

              rawGlobalInjectExpectationsGroupByAttackAndInjectId.forEach(
                  (attackId, injects) -> {
                    if (attackId.equals(attackPatternId)) {
                      injects.forEach(
                          (injectId, expectations) -> {
                            RawGlobalInjectExpectation expectation = expectations.getFirst();
                            InjectExpectationResultsByAttackPattern.InjectExpectationResultsByType
                                resultInjectExpectationResultsByAttackPattern =
                                    new InjectExpectationResultsByAttackPattern
                                        .InjectExpectationResultsByType();
                            resultInjectExpectationResultsByAttackPattern.setInjectTitle(
                                expectation.getInject_title());

                            ArrayList<RawInjectExpectation> expectationsRefined = new ArrayList<>();

                            expectations.stream()
                                .forEach(
                                    e -> {
                                      if (e.getInject_expectation_type() != null) {
                                        SimpleRawInjectExpectation rawInjectExpectation =
                                            new SimpleRawInjectExpectation();
                                        rawInjectExpectation.setInject_expectation_score(
                                            e.getInject_expectation_score());
                                        rawInjectExpectation.setInject_expectation_expected_score(
                                            e.getInject_expectation_expected_score());
                                        rawInjectExpectation.setInject_expectation_type(
                                            e.getInject_expectation_type());
                                        expectationsRefined.add(rawInjectExpectation);
                                      }
                                    });

                            resultInjectExpectationResultsByAttackPattern.setResults(
                                AtomicTestingUtils.getExpectationResultByTypesFromRaw(
                                    expectationsRefined));

                            results.add(resultInjectExpectationResultsByAttackPattern);
                          });
                    }
                  });

              resultExpectation.setResults(results);

              return resultExpectation;
            })
        .collect(Collectors.toList());
  }
}
