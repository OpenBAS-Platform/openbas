package io.openbas.rest.challenge;

import static io.openbas.config.OpenBASAnonymous.ANONYMOUS;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.injectors.challenge.ChallengeContract.CHALLENGE_PUBLISH;
import static io.openbas.rest.challenge.ChallengeHelper.resolveChallengeIds;
import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;

import io.openbas.database.model.Inject;
import io.openbas.database.model.User;
import io.openbas.database.repository.ChallengeRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.database.specification.InjectSpecification;
import io.openbas.rest.challenge.form.ChallengeTryInput;
import io.openbas.rest.challenge.output.ChallengeOutput;
import io.openbas.rest.challenge.response.SimulationChallengesReader;
import io.openbas.rest.exception.InputValidationException;
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

  private final ChallengeService challengeService;

  @PreAuthorize("isExerciseObserver(#exerciseId)")
  @GetMapping(EXERCISE_URI + "/{exerciseId}/challenges")
  @Transactional(readOnly = true)
  public Iterable<ChallengeOutput> exerciseChallenges(
      @PathVariable @NotBlank final String exerciseId) {
    List<Inject> injects =
        this.injectRepository.findAll(
            InjectSpecification.fromExercise(exerciseId)
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
}
