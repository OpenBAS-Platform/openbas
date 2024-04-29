package io.openbas.rest.statistic;

import io.openbas.atomic_testing.AtomicTestingMapper.ExpectationResultsByType;
import io.openbas.config.OpenBASPrincipal;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.database.repository.*;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.form.InjectExpectationResultsByAttackPattern;
import io.openbas.rest.statistic.response.PlatformStatistic;
import io.openbas.rest.statistic.response.StatisticElement;
import io.openbas.utils.ResultUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.helper.StreamHelper.fromIterable;

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
  @ApiResponse(responseCode = "200", description = "Successful operation", content = {
      @Content(mediaType = "application/json", schema = @Schema(implementation = PlatformStatistic.class))
  })
  public PlatformStatistic platformStatistic() {
    Instant now = Instant.now();
    PlatformStatistic statistic = new PlatformStatistic();
    statistic.setScenariosCount(computeStat(now, scenarioRepository));
    statistic.setExercisesCount(computeStat(now, exerciseRepository));
    statistic.setUsersCount(computeStat(now, userRepository));
    statistic.setTeamsCount(computeStat(now, teamRepository));
    statistic.setAssetsCount(computeStat(now, endpointRepository));
    statistic.setAssetGroupsCount(computeStat(now, assetGroupRepository));
    statistic.setInjectsCount(computeStat(now, injectRepository));
    statistic.setResults(computeExpectationResults(now));
    statistic.setInjectResults(computeInjectExpectationResults(now));
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

  private StatisticElement computeStat(Instant from, StatisticRepository repository) {
    return currentUser().isAdmin()
        ? computeGlobalStat(from, repository)
        : computeUserStat(from, repository);
  }

  // -- GLOBAL SCORE --

  private List<ExpectationResultsByType> computeExpectationResults(@NotNull final Instant from) {
    return currentUser().isAdmin()
        ? computeGlobalExpectationResults(from)
        : computeUserExpectationResults(from);
  }

  private List<ExpectationResultsByType> computeGlobalExpectationResults(@NotNull final Instant from) {
    List<Exercise> exercises = fromIterable(this.exerciseRepository.findAll());
    List<Inject> injects = exercises.stream()
        .flatMap(e -> e.getInjects().stream().filter(i -> i.getCreatedAt().isBefore(from)))
        .toList();
    return ResultUtils.computeGlobalExpectationResults(injects);
  }

  private List<ExpectationResultsByType> computeUserExpectationResults(@NotNull final Instant from) {
    OpenBASPrincipal user = currentUser();
    List<Exercise> exercises = fromIterable(this.exerciseRepository.findAllGranted(user.getId()));
    List<Inject> injects = exercises.stream()
        .flatMap(e -> e.getInjects().stream().filter(i -> i.getCreatedAt().isBefore(from)))
        .toList();
    return ResultUtils.computeGlobalExpectationResults(injects);
  }

  private List<InjectExpectationResultsByAttackPattern> computeInjectExpectationResults(@NotNull final Instant from) {
    return currentUser().isAdmin()
        ? computeGlobalInjectExpectationResults(from)
        : computeUserInjectExpectationResults(from);
  }

  private List<InjectExpectationResultsByAttackPattern> computeGlobalInjectExpectationResults(
      @NotNull final Instant from) {
    List<Exercise> exercises = fromIterable(this.exerciseRepository.findAll());
    List<Inject> injects = exercises.stream()
        .flatMap(e -> e.getInjects().stream().filter(i -> i.getCreatedAt().isBefore(from)))
        .toList();

    return ResultUtils.computeInjectExpectationResults(injects);
  }

  private List<InjectExpectationResultsByAttackPattern> computeUserInjectExpectationResults(
      @NotNull final Instant from) {
    OpenBASPrincipal user = currentUser();

    List<Exercise> exercises = fromIterable(this.exerciseRepository.findAllGranted(user.getId()));
    List<Inject> injects = exercises.stream()
        .flatMap(e -> e.getInjects().stream().filter(i -> i.getCreatedAt().isBefore(from)))
        .toList();

    return ResultUtils.computeInjectExpectationResults(injects);
  }

}
