package io.openbas.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.atomic_testing.AtomicTestingMapper;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Tag;
import io.openbas.helper.MultiIdDeserializer;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.BeanUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static io.openbas.rest.exercise.ExerciseUtils.computeGlobalExpectationResults;

@Setter
@Getter
public class ExerciseSimple {

    @JsonProperty("exercise_id")
    private String id;

    @JsonProperty("exercise_name")
    private String name;

    @JsonProperty("exercise_status")
    @Enumerated(EnumType.STRING)
    private Exercise.STATUS status;

    @JsonProperty("exercise_subtitle")
    private String subtitle;

    @JsonProperty("exercise_start_date")
    private Instant start;

    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("exercise_tags")
    private List<Tag> tags = new ArrayList<>();

    @JsonProperty("exercise_global_score")
    private List<AtomicTestingMapper.ExpectationResultsByType> expectationResultByTypes = new ArrayList<>();

    public static ExerciseSimple fromExercise(Exercise exercise) {
        ExerciseSimple simple = new ExerciseSimple();
        BeanUtils.copyProperties(exercise, simple);
        simple.setStart(exercise.getStart().orElse(null));
        simple.setExpectationResultByTypes(computeGlobalExpectationResults(exercise));
        return simple;
    }

}
