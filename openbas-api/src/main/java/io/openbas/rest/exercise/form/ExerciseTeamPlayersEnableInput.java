package io.openbas.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ExerciseTeamPlayersEnableInput {

    @JsonProperty("exercise_team_players")
    private List<String> playersIds = new ArrayList<>();

}
