package io.openbas.rest.exercise;

import io.openbas.database.model.Exercise;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.exercise.response.PublicExercise;
import io.openbas.rest.helper.RestBehavior;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ExercisePlayerApi extends RestBehavior {

  public static final String EXERCISE_URI = "/api/player/exercises";

  private final UserRepository userRepository;
  private final ExerciseRepository exerciseRepository;

  @GetMapping(EXERCISE_URI + "/{exerciseId}")
  public PublicExercise playerExercise(
      @PathVariable String exerciseId, @RequestParam Optional<String> userId) {
    impersonateUser(this.userRepository, userId);
    Exercise exercise =
        this.exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
    return new PublicExercise(exercise);
  }
}
