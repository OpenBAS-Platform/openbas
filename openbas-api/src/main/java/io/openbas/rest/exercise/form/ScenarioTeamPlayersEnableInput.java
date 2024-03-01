package io.openbas.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ScenarioTeamPlayersEnableInput {

    @JsonProperty("scenario_team_players")
    private List<String> playersIds = new ArrayList<>();

}
