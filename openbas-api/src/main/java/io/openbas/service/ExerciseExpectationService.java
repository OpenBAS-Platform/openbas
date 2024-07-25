package io.openbas.service;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.database.model.InjectExpectationResult;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

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
            if (input.getScore() >= injectExpectation.getExpectedScore()) {
                result = "Success";
            } else if (input.getScore() > 0) {
                result = "Partial";
            } else {
                result = "Failed";
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
        return this.injectExpectationRepository.save(injectExpectation);
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
                List<Integer> scores = injectExpectation.getResults().stream().map(InjectExpectationResult::getScore).filter(Objects::nonNull).toList();
                injectExpectation.setScore(!scores.isEmpty() ? Collections.max(scores) : 0);
            }
        }
        injectExpectation.setUpdatedAt(now());
        return this.injectExpectationRepository.save(injectExpectation);
    }
}
