package io.openbas.inject_expectation;

import io.openbas.database.model.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.model.ExecutionProcess;
import io.openbas.model.Expectation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public class InjectExpectationUtils {

  public static void computeResult(
      @NotNull final InjectExpectation expectation,
      @NotBlank final String sourceId,
      @NotBlank final String sourceType,
      @NotBlank final String sourceName,
      @NotBlank final String result,
      @NotBlank final Double score,
      final Map<String, String> metadata) {
    Optional<InjectExpectationResult> exists =
        expectation.getResults().stream().filter(r -> sourceId.equals(r.getSourceId())).findAny();
    if (exists.isPresent()) {
      exists.get().setResult(result);
      exists.get().setMetadata(metadata);
    } else {
      InjectExpectationResult expectationResult =
          InjectExpectationResult.builder()
              .sourceId(sourceId)
              .sourceType(sourceType)
              .sourceName(sourceName)
              .result(result)
              .date(Instant.now().toString())
              .score(score)
              .metadata(metadata)
              .build();
      expectation.getResults().add(expectationResult);
    }
  }

  public static void extractedExpectations(ExecutableInject executableInject, List<Expectation> expectations) {
    boolean isAtomicTesting = executableInject.getInjection().getInject().isAtomicTesting();
    boolean isScheduledInject = !executableInject.isDirect();
    // Create the expectations
    List<Team> teams = executableInject.getTeams();
    List<Asset> assets = executableInject.getAssets();
    List<AssetGroup> assetGroups = executableInject.getAssetGroups();
    if ((isScheduledInject || isAtomicTesting) && !expectations.isEmpty()) {
      if (!teams.isEmpty()) {
        List<InjectExpectation> injectExpectationsByTeam;

        List<InjectExpectation> injectExpectationsByUserAndTeam;
        // If atomicTesting, We create expectation for every player and every team
        if (isAtomicTesting) {
          injectExpectationsByTeam =
              teams.stream()
                  .flatMap(
                      team ->
                          expectations.stream()
                              .map(
                                  expectation ->
                                      expectationConverter(team, executableInject, expectation)))
                  .collect(Collectors.toList());

          injectExpectationsByUserAndTeam =
              teams.stream()
                  .flatMap(
                      team ->
                          team.getUsers().stream()
                              .flatMap(
                                  user ->
                                      expectations.stream()
                                          .map(
                                              expectation ->
                                                  expectationConverter(
                                                      team,
                                                      user,
                                                      executableInject,
                                                      expectation))))
                  .toList();
        } else {
          // Create expectations for every enabled player in every team
          injectExpectationsByUserAndTeam =
              teams.stream()
                  .flatMap(
                      team ->
                          team.getExerciseTeamUsers().stream()
                              .filter(
                                  exerciseTeamUser ->
                                      exerciseTeamUser
                                          .getExercise()
                                          .getId()
                                          .equals(
                                              executableInject
                                                  .getInjection()
                                                  .getExercise()
                                                  .getId()))
                              .flatMap(
                                  exerciseTeamUser ->
                                      expectations.stream()
                                          .map(
                                              expectation ->
                                                  expectationConverter(
                                                      team,
                                                      exerciseTeamUser.getUser(),
                                                      executableInject,
                                                      expectation))))
                  .toList();

          // Create a set of teams that have at least one enabled player
          Set<Team> teamsWithEnabledPlayers =
              injectExpectationsByUserAndTeam.stream()
                  .map(InjectExpectation::getTeam)
                  .collect(Collectors.toSet());

          // Add only the expectations where the team has at least one enabled player
          injectExpectationsByTeam =
              teamsWithEnabledPlayers.stream()
                  .flatMap(
                      team ->
                          expectations.stream()
                              .map(
                                  expectation ->
                                      expectationConverter(team, executableInject, expectation)))
                  .collect(Collectors.toList());
        }

        injectExpectationsByTeam.addAll(injectExpectationsByUserAndTeam);
        this.injectExpectationRepository.saveAll(injectExpectationsByTeam);
      } else if (!assets.isEmpty() || !assetGroups.isEmpty()) {
        List<InjectExpectation> injectExpectations =
            expectations.stream()
                .map(expectation -> expectationConverter(executableInject, expectation))
                .toList();
        this.injectExpectationRepository.saveAll(injectExpectations);
      }
    }
  }
}
