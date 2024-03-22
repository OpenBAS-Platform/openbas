package io.openex.rest.exercise;

import io.openex.database.model.Exercise;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.UserRepository;
import io.openex.rest.exercise.response.PublicExercise;
import io.openex.rest.helper.RestBehavior;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class ExercisePlayerApi extends RestBehavior {

  public static final String EXERCISE_URI = "/api/player/exercises";

  private final UserRepository userRepository;
  private final ExerciseRepository exerciseRepository;

  @GetMapping(EXERCISE_URI + "/{exerciseId}")
  public PublicExercise playerExercise(@PathVariable String exerciseId, @RequestParam Optional<String> userId) {
    impersonateUser(this.userRepository, userId);
    Exercise exercise = this.exerciseRepository.findById(exerciseId).orElseThrow();
    return new PublicExercise(exercise);
  }

}
