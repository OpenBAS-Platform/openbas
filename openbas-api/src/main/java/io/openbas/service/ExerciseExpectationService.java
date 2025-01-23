package io.openbas.service;

import static java.time.Instant.now;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.database.model.InjectExpectationResult;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class ExerciseExpectationService {

  private final InjectExpectationRepository injectExpectationRepository;
  private final ExerciseRepository exerciseRepository;
  private final InjectExpectationService injectExpectationService;

  public List<InjectExpectation> injectExpectations(@NotBlank final String exerciseId) {
    Exercise exercise = this.exerciseRepository.findById(exerciseId).orElseThrow();
    return this.injectExpectationRepository.findAllForExercise(exercise.getId());
  }

  public InjectExpectation updateInjectExpectation(
      @NotBlank final String expectationId, @NotNull final ExpectationUpdateInput input) {
    InjectExpectation injectExpectation =
        this.injectExpectationRepository.findById(expectationId).orElseThrow();
    Optional<InjectExpectationResult> exists =
        injectExpectation.getResults().stream()
            .filter(r -> input.getSourceId().equals(r.getSourceId()))
            .findAny();

    String result;
    if (injectExpectation.getType() == EXPECTATION_TYPE.MANUAL) {
      result = input.getScore() >= injectExpectation.getExpectedScore() ? "Success" : "Failed";
      injectExpectation.getResults().clear();
      exists = Optional.empty();
    } else if (injectExpectation.getType() == EXPECTATION_TYPE.DETECTION) {
      if (input.getScore() >= injectExpectation.getExpectedScore()) {
        result = "Detected";
      } else if (input.getScore() > 0) {
        result = "Partially Detected";
      } else {
        result = "Not Detected";
      }
    } else if (injectExpectation.getType() == EXPECTATION_TYPE.PREVENTION) {
      if (input.getScore() >= injectExpectation.getExpectedScore()) {
        result = "Prevented";
      } else if (input.getScore() > 0) {
        result = "Partially Prevented";
      } else {
        result = "Not Prevented";
      }
    } else {
      result = "";
    }
    if (exists.isPresent()) {
      exists.get().setResult(result);
      exists.get().setScore(input.getScore());
      exists.get().setDate(now().toString());
    } else {
      injectExpectation
          .getResults()
          .add(
              buildInjectExpectationResult(
                  input.getSourceId(),
                  input.getSourceType(),
                  input.getSourceName(),
                  result,
                  input.getScore()));
    }
    if (injectExpectation.getScore() == null) {
      injectExpectation.setScore(input.getScore());
    } else {
      if (input.getScore() > injectExpectation.getScore()
          || injectExpectation.getType() == EXPECTATION_TYPE.MANUAL) {
        injectExpectation.setScore(input.getScore());
      } else {
        injectExpectation.setScore(
            Collections.max(
                injectExpectation.getResults().stream()
                    .map(InjectExpectationResult::getScore)
                    .filter(Objects::nonNull)
                    .toList()));
      }
    }
    injectExpectation.setUpdatedAt(now());
    InjectExpectation updated = this.injectExpectationRepository.save(injectExpectation);

    boolean isAssetGroupExpectation = updated.getAssetGroup() != null && updated.getAsset() == null;

    if (isAssetGroupExpectation) {
      // Update InjectExpectations for Assets linked to this asset group
      List<InjectExpectation> expectationAssets =
          injectExpectationService.expectationsForAssets(
              updated.getInject(), updated.getAssetGroup(), updated.getType());

      expectationAssets.forEach(
          assetExp -> {
            assetExp
                .getResults()
                .add(
                    buildInjectExpectationResult(
                        input.getSourceId(),
                        input.getSourceType(),
                        input.getSourceName(),
                        result,
                        input.getScore()));
            assetExp.setScore(updated.getScore());
            assetExp.setUpdatedAt(updated.getUpdatedAt());
            updateInjectExpectationAgent(input, assetExp, result);
          });
      injectExpectationRepository.saveAll(expectationAssets);
    } else {
      updateInjectExpectationAgent(input, updated, result);
    }

    // If the expectation is type manual, We should update expectations for teams and players
    if (updated.getType() == EXPECTATION_TYPE.MANUAL && updated.getTeam() != null) {
      computeExpectationsForTeamsAndPlayer(updated, result);
    }
    return updated;
  }

  private void updateInjectExpectationAgent(
      ExpectationUpdateInput input, InjectExpectation updated, String result) {
    // Update InjectExpectations for Agents installed on this asset
    List<InjectExpectation> expectationAgents =
        injectExpectationService.expectationsForAgents(
            updated.getInject(), updated.getAsset(), updated.getType());

    expectationAgents.forEach(
        agentExp -> {
          agentExp
              .getResults()
              .add(
                  buildInjectExpectationResult(
                      input.getSourceId(),
                      input.getSourceType(),
                      input.getSourceName(),
                      result,
                      input.getScore()));

          agentExp.setScore(updated.getScore());
          agentExp.setUpdatedAt(updated.getUpdatedAt());
        });

    injectExpectationRepository.saveAll(expectationAgents);
  }

  public InjectExpectation deleteInjectExpectationResult(
      @NotBlank final String expectationId, @NotBlank final String sourceId) {
    InjectExpectation injectExpectation =
        this.injectExpectationRepository.findById(expectationId).orElseThrow();
    Optional<InjectExpectationResult> exists =
        injectExpectation.getResults().stream()
            .filter(r -> sourceId.equals(r.getSourceId()))
            .findAny();
    if (exists.isPresent()) {
      injectExpectation.setResults(
          injectExpectation.getResults().stream()
              .filter(r -> !sourceId.equals(r.getSourceId()))
              .toList());
      if (injectExpectation.getType() == EXPECTATION_TYPE.MANUAL) {
        injectExpectation.setScore(null);
      } else {
        List<Double> scores =
            injectExpectation.getResults().stream()
                .map(InjectExpectationResult::getScore)
                .filter(Objects::nonNull)
                .toList();
        injectExpectation.setScore(!scores.isEmpty() ? Collections.max(scores) : 0.0);
      }
    }
    injectExpectation.setUpdatedAt(now());
    InjectExpectation updated = this.injectExpectationRepository.save(injectExpectation);

    boolean isAssetGroupExpectation = updated.getAssetGroup() != null && updated.getAsset() == null;

    if (isAssetGroupExpectation) {
      // Delete result InjectExpectations for Assets linked to this asset group
      List<InjectExpectation> expectationAssets =
          injectExpectationService.expectationsForAssets(
              updated.getInject(), updated.getAssetGroup(), updated.getType());

      expectationAssets.forEach(
          assetExp -> {
            assetExp.setResults(
                assetExp.getResults().stream()
                    .filter(r -> !sourceId.equals(r.getSourceId()))
                    .toList());
            assetExp.setScore(updated.getScore());
            assetExp.setUpdatedAt(updated.getUpdatedAt());
            deleteInjectExpectationResultAgent(sourceId, assetExp);
          });

      injectExpectationRepository.saveAll(expectationAssets);
    } else {
      deleteInjectExpectationResultAgent(sourceId, updated);
    }

    // If The expectation is type manual, We should update expectations for teams and players
    if (updated.getType() == EXPECTATION_TYPE.MANUAL && updated.getTeam() != null) {
      computeExpectationsForTeamsAndPlayer(updated, null);
    }

    return updated;
  }

  private void deleteInjectExpectationResultAgent(String sourceId, InjectExpectation updated) {
    // Update InjectExpectations for Agents installed on this asset
    List<InjectExpectation> expectationAgents =
        injectExpectationService.expectationsForAgents(
            updated.getInject(), updated.getAsset(), updated.getType());

    expectationAgents.forEach(
        agentExp -> {
          agentExp.setResults(
              agentExp.getResults().stream()
                  .filter(r -> !sourceId.equals(r.getSourceId()))
                  .toList());
          agentExp.setScore(updated.getScore());
          agentExp.setUpdatedAt(updated.getUpdatedAt());
        });

    injectExpectationRepository.saveAll(expectationAgents);
  }

  // -- VALIDATION TYPE --
  private void computeExpectationsForTeamsAndPlayer(InjectExpectation updated, String result) {
    // If the updated expectation was a player expectation, We have to update the team expectation
    // using player expectations (based on validation type)
    if (updated.getUser() != null) {
      List<InjectExpectation> toProcess =
          injectExpectationRepository.findAllByInjectAndTeamAndExpectationName(
              updated.getInject().getId(), updated.getTeam().getId(), updated.getName());
      InjectExpectation parentExpectation =
          toProcess.stream()
              .filter(exp -> exp.getUser() == null)
              .findFirst()
              .orElseThrow(ElementNotFoundException::new);
      List<InjectExpectation> playersExpectations =
          toProcess.stream().filter(exp -> exp.getUser() != null).toList();
      List<InjectExpectation> playersAnsweredExpectations =
          playersExpectations.stream().filter(exp -> exp.getScore() != null).toList();

      if (updated.isExpectationGroup()) { // If At least one player
        List<InjectExpectation> successPlayerExpectations =
            playersExpectations.stream()
                .filter(exp -> exp.getScore() != null)
                .filter(exp -> exp.getScore() >= updated.getExpectedScore())
                .toList();

        if (!successPlayerExpectations.isEmpty()) { // At least one player success
          result = "Success";
          OptionalDouble avgSuccessPlayer =
              successPlayerExpectations.stream().mapToDouble(InjectExpectation::getScore).average();
          parentExpectation.setScore(avgSuccessPlayer.getAsDouble());
        } else if (playersAnsweredExpectations.size()
            == playersExpectations.size()) { // All players had answers and no one success
          result = "Failed";
          parentExpectation.setScore(0.0);
        } else {
          result = "Pending";
          parentExpectation.setScore(null);
        }

      } else { // All Player
        boolean hasFailedPlayer =
            playersExpectations.stream()
                .filter(exp -> exp.getScore() != null)
                .anyMatch(exp -> exp.getScore() < updated.getExpectedScore());

        if (hasFailedPlayer) {
          result = "Failed";
        } else if (playersAnsweredExpectations.size()
            == playersExpectations.size()) { // All players answered and no failures
          result = "Success";
        } else { // Some players haven't answered yet
          result = "Pending";
          parentExpectation.setScore(null);
        }

        if (!result.equals("Pending")) {
          OptionalDouble avgAllPlayer =
              playersAnsweredExpectations.stream()
                  .mapToDouble(InjectExpectation::getScore)
                  .average();
          parentExpectation.setScore(avgAllPlayer.orElse(0.0));
        }
      }

      parentExpectation.setUpdatedAt(Instant.now());
      parentExpectation.getResults().clear();
      parentExpectation
          .getResults()
          .add(
              buildInjectExpectationResult(
                  "player-manual-validation",
                  "player-manual-validation",
                  "Player Manual Validation",
                  result,
                  parentExpectation.getScore()));
      injectExpectationRepository.save(parentExpectation);

    } else {
      // If I update the expectation team: What happens with children? -> update expectation score
      // for all children -> set score from InjectExpectation
      List<InjectExpectation> toProcess =
          injectExpectationRepository.findAllByInjectAndTeamAndExpectationNameAndUserIsNotNull(
              updated.getInject().getId(), updated.getTeam().getId(), updated.getName());
      for (InjectExpectation expectation : toProcess) {
        expectation.setScore(updated.getScore());
        expectation.setUpdatedAt(Instant.now());
        expectation.getResults().clear();
        if (result != null) {
          expectation
              .getResults()
              .add(
                  buildInjectExpectationResult(
                      "team-manual-validation",
                      "team-manual-validation",
                      "Team Manual Validation",
                      result,
                      updated.getScore()));
        }
        injectExpectationRepository.save(expectation);
      }
    }
  }

  private InjectExpectationResult buildInjectExpectationResult(
      String id, String type, String name, String resultStatus, Double score) {
    return InjectExpectationResult.builder()
        .sourceId(id)
        .sourceType(type)
        .sourceName(name)
        .result(resultStatus)
        .date(now().toString())
        .score(score)
        .build();
  }
}
