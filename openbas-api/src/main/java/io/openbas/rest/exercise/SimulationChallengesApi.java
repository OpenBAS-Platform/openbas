package io.openbas.rest.exercise;

import static io.openbas.config.OpenBASAnonymous.ANONYMOUS;
import static io.openbas.helper.StreamHelper.fromIterable;

import io.openbas.database.model.*;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.challenge.response.ChallengeInformation;
import io.openbas.rest.challenge.response.SimulationChallengesReader;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.exercise.service.SimulationService;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.ChallengeService;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class SimulationChallengesApi extends RestBehavior {

  private final ExerciseRepository exerciseRepository;
  private final UserRepository userRepository;

  private final ChallengeService challengeService;
  private final SimulationService simulationService;

  @GetMapping("/api/player/simulations/{simulationId}/documents")
  public List<Document> playerDocuments(
      @PathVariable String simulationId, @RequestParam Optional<String> userId) {
    Optional<Exercise> exerciseOpt = this.exerciseRepository.findById(simulationId);
    final User user = impersonateUser(userRepository, userId);
    if (user.getId().equals(ANONYMOUS)) {
      throw new UnsupportedOperationException("User must be logged or dynamic player is required");
    }
    if (exerciseOpt.isPresent()) {
      if (!exerciseOpt.get().isUserHasAccess(user)
          && !exerciseOpt.get().getUsers().contains(user)) {
        throw new UnsupportedOperationException("The given player is not in this exercise");
      }
      return simulationService.getExercisePlayerDocuments(exerciseOpt.get());
    } else {
      throw new IllegalArgumentException("Simulation ID not found");
    }
  }

  @GetMapping("/api/observer/simulations/{simulationId}/challenges")
  public SimulationChallengesReader observerChallenges(@PathVariable String simulationId) {
    Exercise exercise =
        exerciseRepository.findById(simulationId).orElseThrow(ElementNotFoundException::new);
    SimulationChallengesReader simulationChallengesReader =
        new SimulationChallengesReader(exercise);
    Iterable<Challenge> challenges = challengeService.getExerciseChallenges(simulationId);
    simulationChallengesReader.setExerciseChallenges(
        fromIterable(challenges).stream()
            .map(challenge -> new ChallengeInformation(challenge, null, 0))
            .toList());
    return simulationChallengesReader;
  }
}
