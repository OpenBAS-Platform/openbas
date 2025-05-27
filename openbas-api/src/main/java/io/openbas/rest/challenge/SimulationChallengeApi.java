package io.openbas.rest.challenge;

import static io.openbas.config.OpenBASAnonymous.ANONYMOUS;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.injectors.challenge.ChallengeContract.CHALLENGE_PUBLISH;
import static io.openbas.rest.challenge.ChallengeHelper.resolveChallengeIds;
import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;

import io.openbas.database.model.*;
import io.openbas.database.repository.ChallengeRepository;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.database.specification.InjectSpecification;
import io.openbas.rest.challenge.form.ChallengeTryInput;
import io.openbas.rest.challenge.output.ChallengeOutput;
import io.openbas.rest.challenge.response.ChallengeInformation;
import io.openbas.rest.challenge.response.SimulationChallengesReader;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.exception.InputValidationException;
import io.openbas.rest.exercise.service.SimulationService;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.ChallengeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class SimulationChallengeApi extends RestBehavior {

  private final InjectRepository injectRepository;
  private final ChallengeRepository challengeRepository;
  private final UserRepository userRepository;
  private final ExerciseRepository exerciseRepository;

  private final ChallengeService challengeService;
  private final SimulationService simulationService;

  @PreAuthorize("isExerciseObserver(#exerciseId)")
  @GetMapping(EXERCISE_URI + "/{exerciseId}/challenges")
  @Transactional(readOnly = true)
  public Iterable<ChallengeOutput> exerciseChallenges(
      @PathVariable @NotBlank final String exerciseId) {
    List<Inject> injects =
        this.injectRepository.findAll(
            InjectSpecification.fromSimulation(exerciseId)
                .and(InjectSpecification.fromContract(CHALLENGE_PUBLISH)));
    List<String> challengeIds = resolveChallengeIds(injects, this.mapper);
    return fromIterable(this.challengeRepository.findAllById(challengeIds)).stream()
        .map(ChallengeOutput::from)
        .peek(c -> c.setExerciseIds(List.of(exerciseId)))
        .toList();
  }

  @PostMapping("/api/player/challenges/{exerciseId}/{challengeId}/validate")
  @jakarta.transaction.Transactional(rollbackOn = Exception.class)
  public SimulationChallengesReader validateChallenge(
      @PathVariable String exerciseId,
      @PathVariable String challengeId,
      @Valid @RequestBody ChallengeTryInput input,
      @RequestParam Optional<String> userId)
      throws InputValidationException {
    validateUUID(exerciseId);
    validateUUID(challengeId);

    final User user = impersonateUser(userRepository, userId);
    if (user.getId().equals(ANONYMOUS)) {
      throw new UnsupportedOperationException("User must be logged or dynamic player is required");
    }
    return challengeService.validateChallenge(exerciseId, challengeId, input, user);
  }

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

  @GetMapping("/api/player/simulations/{simulationId}/challenges")
  public SimulationChallengesReader playerChallenges(
      @PathVariable String simulationId, @RequestParam Optional<String> userId) {
    final User user = impersonateUser(userRepository, userId);
    if (user.getId().equals(ANONYMOUS)) {
      throw new UnsupportedOperationException("User must be logged or dynamic player is required");
    }
    return challengeService.playerChallenges(simulationId, user);
  }
}
