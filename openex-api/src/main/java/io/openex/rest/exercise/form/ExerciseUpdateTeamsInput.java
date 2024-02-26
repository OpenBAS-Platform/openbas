package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ExerciseUpdateTeamsInput {

    @JsonProperty("exercise_teams")
    private List<String> teamIds = new ArrayList<>();

}
