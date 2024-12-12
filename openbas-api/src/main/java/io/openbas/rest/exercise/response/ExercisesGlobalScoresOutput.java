package io.openbas.rest.exercise.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.utils.AtomicTestingUtils.ExpectationResultsByType;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

public record ExercisesGlobalScoresOutput(
    @JsonProperty("global_scores_by_exercise_ids") @NotNull
        Map<String, List<ExpectationResultsByType>> globalScoresByExerciseIds) {}
