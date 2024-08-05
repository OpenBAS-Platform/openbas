package io.openbas.service;

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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

import static java.time.Instant.now;

@RequiredArgsConstructor
@Service
public class ExerciseExpectationService {

    private final InjectExpectationRepository injectExpectationRepository;
    private final ExerciseRepository exerciseRepository;

    public List<InjectExpectation> injectExpectations(@NotBlank final String exerciseId) {
        Exercise exercise = this.exerciseRepository.findById(exerciseId).orElseThrow();
        return this.injectExpectationRepository.findAllForExercise(exercise.getId());
    }

    public InjectExpectation updateInjectExpectation(
            @NotBlank final String expectationId,
            @NotNull final ExpectationUpdateInput input) {
        InjectExpectation injectExpectation = this.injectExpectationRepository.findById(expectationId).orElseThrow();
        Optional<InjectExpectationResult> exists = injectExpectation.getResults()
                .stream()
                .filter(r -> input.getSourceId().equals(r.getSourceId()))
                .findAny();

        String result = "";
        if (injectExpectation.getType() == EXPECTATION_TYPE.MANUAL) {
            if (injectExpectation.getTeam() != null && injectExpectation.getUser() == null) { //If it is a team expectation
                result = input.getScore() > 0 ? "Success" : "Failed";
                injectExpectation.getResults().clear();
                exists = Optional.empty();
            } else {
                if (input.getScore() >= injectExpectation.getExpectedScore()) {
                    result = "Success";
                } else if (input.getScore() > 0) {
                    result = "Partial";
                } else {
                    result = "Failed";
                }
            }
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
        }
        if (exists.isPresent()) {
            exists.get().setResult(result);
            exists.get().setScore(input.getScore());
            exists.get().setDate(now().toString());
        } else {
            InjectExpectationResult expectationResult = InjectExpectationResult.builder()
                    .sourceId(input.getSourceId())
                    .sourceType(input.getSourceType())
                    .sourceName(input.getSourceName())
                    .result(result)
                    .date(now().toString())
                    .score(input.getScore())
                    .build();
            injectExpectation.getResults().add(expectationResult);
        }
        if (injectExpectation.getScore() == null) {
            injectExpectation.setScore(input.getScore());
        } else {
            if (input.getScore() > injectExpectation.getScore() || injectExpectation.getType() == EXPECTATION_TYPE.MANUAL) {
                injectExpectation.setScore(input.getScore());
            } else {
                injectExpectation.setScore(Collections.max(injectExpectation.getResults().stream().map(InjectExpectationResult::getScore).filter(Objects::nonNull).toList()));
            }
        }
        injectExpectation.setUpdatedAt(now());
        InjectExpectation updated = this.injectExpectationRepository.save(injectExpectation);

        // If The expectation is type manual, We should update expectations for teams and players
        if (updated.getType() == EXPECTATION_TYPE.MANUAL && updated.getTeam() != null) {
            computeExpectationsForTeamsAndPlayer(updated, result);
        }
        return updated;
    }

    public InjectExpectation deleteInjectExpectationResult(
            @NotBlank final String expectationId,
            @NotBlank final String sourceId) {
        InjectExpectation injectExpectation = this.injectExpectationRepository.findById(expectationId).orElseThrow();
        Optional<InjectExpectationResult> exists = injectExpectation.getResults()
                .stream()
                .filter(r -> sourceId.equals(r.getSourceId()))
                .findAny();
        if (exists.isPresent()) {
            injectExpectation.setResults(injectExpectation.getResults()
                    .stream()
                    .filter(r -> !sourceId.equals(r.getSourceId())).toList());
            if (injectExpectation.getType() == EXPECTATION_TYPE.MANUAL) {
                injectExpectation.setScore(null);
            } else {
                List<Double> scores = injectExpectation.getResults().stream().map(InjectExpectationResult::getScore).filter(Objects::nonNull).toList();
                injectExpectation.setScore(!scores.isEmpty() ? Collections.max(scores) : 0.0);
            }
        }
        injectExpectation.setUpdatedAt(now());
        InjectExpectation updated = this.injectExpectationRepository.save(injectExpectation);

        // If The expectation is type manual, We should update expectations for teams and players
        if (updated.getType() == EXPECTATION_TYPE.MANUAL && updated.getTeam() != null) {
            computeExpectationsForTeamsAndPlayer(updated, null);
        }

        return updated;
    }

    // -- VALIDATION TYPE --
    private void computeExpectationsForTeamsAndPlayer(InjectExpectation updated, String result) {
        //If the updated expectation was a player expectation, We have to update the team expectation using player expectations (based on validation type)
        if (updated.getUser() != null) {
            List<InjectExpectation> toProcess = injectExpectationRepository.findAllByInjectAndTeamAndExpectationName(updated.getInject().getId(), updated.getTeam().getId(), updated.getName());
            InjectExpectation parentExpectation = toProcess.stream().filter(exp -> exp.getUser() == null).findFirst().orElseThrow(ElementNotFoundException::new);
            int playersSize = toProcess.size() - 1; // Without Parent expectation
            long zeroPlayerResponses = toProcess.stream().filter(exp -> exp.getUser() != null).filter(exp -> exp.getScore() != null).filter(exp -> exp.getScore() == 0.0).count();
            long nullPlayerResponses = toProcess.stream().filter(exp -> exp.getUser() != null).filter(exp -> exp.getScore() == null).count();

            if (updated.isExpectationGroup()) { //If true is at least one
                OptionalDouble avgAtLeastOnePlayer = toProcess.stream().filter(exp -> exp.getUser() != null).filter(exp -> exp.getScore() != null).filter(exp -> exp.getScore() > 0.0).mapToDouble(InjectExpectation::getScore).average();
                if (avgAtLeastOnePlayer.isPresent()) { //Any response is positive
                    parentExpectation.setScore(avgAtLeastOnePlayer.getAsDouble());
                    result = "Success";
                } else {
                    if (zeroPlayerResponses == playersSize) { //All players had failed
                        parentExpectation.setScore(0.0);
                        result = "Failed";
                    } else {
                        parentExpectation.setScore(null);
                        result = "Pending";
                    }
                }
            } else { // all
                if(nullPlayerResponses == 0){
                    OptionalDouble avgAllPlayer = toProcess.stream().filter(exp -> exp.getUser() != null).mapToDouble(InjectExpectation::getScore).average();
                    parentExpectation.setScore(avgAllPlayer.getAsDouble());
                    result = zeroPlayerResponses > 0 ? "Failed" : "Success";
                }else{
                    if(zeroPlayerResponses == 0) {
                        parentExpectation.setScore(null);
                        result = "Pending";
                    }else{
                        double sumAllPlayer = toProcess.stream().filter(exp -> exp.getUser() != null).filter(exp->exp.getScore() != null).mapToDouble(InjectExpectation::getScore).sum();
                        parentExpectation.setScore(sumAllPlayer/playersSize);
                        result = "Failed";
                    }
                }
            }
            parentExpectation.setUpdatedAt(Instant.now());
            parentExpectation.getResults().clear();
            InjectExpectationResult expectationResult = InjectExpectationResult.builder()
                    .sourceId("player-manual-validation")
                    .sourceType("player-manual-validation")
                    .sourceName("Player Manual Validation")
                    .result(result)
                    .date(now().toString())
                    .score(parentExpectation.getScore())
                    .build();
            parentExpectation.getResults().add(expectationResult);
            injectExpectationRepository.save(parentExpectation);
        } else {
            // If I update the expectation team: What happens with children? -> update expectation score for all children -> set score from InjectExpectation
            List<InjectExpectation> toProcess = injectExpectationRepository.findAllByInjectAndTeamAndExpectationNameAndUserIsNotNull(updated.getInject().getId(), updated.getTeam().getId(), updated.getName());
            for (InjectExpectation expectation : toProcess) {
                expectation.setScore(updated.getScore());
                expectation.setUpdatedAt(Instant.now());
                expectation.getResults().clear();
                if(result != null) {
                    InjectExpectationResult expectationResult = InjectExpectationResult.builder()
                            .sourceId("team-manual-validation")
                            .sourceType("team-manual-validation")
                            .sourceName("Team Manual Validation")
                            .result(result)
                            .date(now().toString())
                            .score(updated.getScore())
                            .build();
                    expectation.getResults().add(expectationResult);
                }
                injectExpectationRepository.save(expectation);
            }
        }
    }
}
