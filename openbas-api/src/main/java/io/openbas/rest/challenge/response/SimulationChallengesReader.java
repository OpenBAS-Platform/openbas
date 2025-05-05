package io.openbas.rest.challenge.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Exercise;
import io.openbas.rest.exercise.response.PublicExercise;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class SimulationChallengesReader {

  @JsonProperty("exercise_id")
  private String id;

  @JsonProperty("exercise_information")
  private PublicExercise exercise;

  @JsonProperty("exercise_challenges")
  private List<ChallengeInformation> exerciseChallenges = new ArrayList<>();

  public SimulationChallengesReader(Exercise exercise) {
    this.id = exercise.getId();
    this.exercise = new PublicExercise(exercise);
  }

}
