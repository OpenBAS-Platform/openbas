package io.openbas.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class ExerciseUpdateTagsInput {

    @JsonProperty("exercise_tags")
    private List<String> tagIds = new ArrayList<>();

}
