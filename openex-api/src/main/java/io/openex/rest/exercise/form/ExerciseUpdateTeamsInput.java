package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

public class ExerciseUpdateTeamsInput {

    @JsonProperty("exercise_teams")
    private List<String> teamIds = new ArrayList<>();

    public List<String> getTeamIds() {
        return teamIds;
    }

    public void setTeamIds(List<String> teamIds) {
        this.teamIds = teamIds;
    }
}
