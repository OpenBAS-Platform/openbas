package io.openbas.rest.challenge.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Exercise;
import io.openbas.rest.exercise.response.PublicExercise;
import java.util.ArrayList;
import java.util.List;

public class ChallengesReader {

  @JsonProperty("exercise_id")
  private String id;

  @JsonProperty("exercise_information")
  private PublicExercise exercise;

  @JsonProperty("exercise_challenges")
  private List<ChallengeInformation> exerciseChallenges = new ArrayList<>();

  public ChallengesReader(Exercise exercise) {
    this.id = exercise.getId();
    this.exercise = new PublicExercise(exercise);
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public PublicExercise getExercise() {
    return exercise;
  }

  public void setExercise(PublicExercise exercise) {
    this.exercise = exercise;
  }

  public List<ChallengeInformation> getExerciseChallenges() {
    return exerciseChallenges;
  }

  public void setExerciseChallenges(List<ChallengeInformation> exerciseChallenges) {
    this.exerciseChallenges = exerciseChallenges;
  }
}
