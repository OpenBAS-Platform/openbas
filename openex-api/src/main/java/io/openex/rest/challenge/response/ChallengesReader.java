package io.openex.rest.challenge.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Challenge;
import io.openex.database.model.Exercise;

import java.util.ArrayList;
import java.util.List;

public class ChallengesReader {

    @JsonProperty("exercise_id")
    private String id;

    @JsonProperty("exercise_information")
    private Exercise exercise;

    @JsonProperty("exercise_challenges")
    private List<Challenge> exerciseChallenges = new ArrayList<>();

    public ChallengesReader(Exercise exercise) {
        this.id = exercise.getId();
        this.exercise = exercise;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public List<Challenge> getExerciseChallenges() {
        return exerciseChallenges;
    }

    public void setExerciseChallenges(List<Challenge> exerciseChallenges) {
        this.exerciseChallenges = exerciseChallenges;
    }
}
