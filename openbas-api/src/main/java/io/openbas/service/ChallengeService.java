package io.openbas.service;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.injectors.challenge.ChallengeContract.CHALLENGE_PUBLISH;
import static io.openbas.utils.challenge.ChallengeAttemptUtils.challengeAttempt;
import static io.openbas.utils.challenge.ChallengeAttemptUtils.challengeAttemptId;
import static io.openbas.utils.challenge.ChallengeExpectationUtils.buildChallengeUpdateInput;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import io.openbas.database.repository.ChallengeRepository;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.injectors.challenge.model.ChallengeContent;
import io.openbas.rest.challenge.form.ChallengeTryInput;
import io.openbas.rest.challenge.response.ChallengeInformation;
import io.openbas.rest.challenge.response.ChallengeResult;
import io.openbas.rest.challenge.response.ChallengesReader;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import io.openbas.service.challenge.ChallengeAttemptService;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChallengeService {

  private final ExerciseRepository exerciseRepository;
  private final ChallengeRepository challengeRepository;
  private final InjectRepository injectRepository;
  private final InjectExpectationService injectExpectationService;
  private final InjectExpectationRepository injectExpectationRepository;
  private final ChallengeAttemptService challengeAttemptService;
  @Resource protected ObjectMapper mapper;

  public Challenge enrichChallengeWithExercisesOrScenarios(@NotNull Challenge challenge) {
    List<Inject> injects =
        fromIterable(this.injectRepository.findAllForChallengeId("%" + challenge.getId() + "%"));
    List<String> exerciseIds =
        injects.stream()
            .filter(i -> i.getExercise() != null)
            .map(i -> i.getExercise().getId())
            .distinct()
            .toList();
    challenge.setExerciseIds(exerciseIds);
    List<String> scenarioIds =
        injects.stream()
            .filter(i -> i.getScenario() != null)
            .map(i -> i.getScenario().getId())
            .distinct()
            .toList();
    challenge.setScenarioIds(scenarioIds);
    return challenge;
  }

  public Iterable<Challenge> getExerciseChallenges(@NotBlank final String exerciseId) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    return StreamSupport.stream(getInjectsChallenges(exercise.getInjects()).spliterator(), false)
        .map(this::enrichChallengeWithExercisesOrScenarios)
        .toList();
  }

  public Iterable<Challenge> getScenarioChallenges(@NotNull final Scenario scenario) {
    return StreamSupport.stream(getInjectsChallenges(scenario.getInjects()).spliterator(), false)
        .map(this::enrichChallengeWithExercisesOrScenarios)
        .toList();
  }

  public Iterable<Challenge> getInjectsChallenges(@NotNull final List<Inject> injects) {
    return resolveChallenges(injects).toList();
  }

  public ChallengeResult tryChallenge(String challengeId, ChallengeTryInput input) {
    Challenge challenge =
        challengeRepository
            .findById(challengeId)
            .orElseThrow(() -> new ElementNotFoundException("Challenge not found"));
    for (ChallengeFlag flag : challenge.getFlags()) {
      if (checkFlag(flag, input.getValue())) {
        return new ChallengeResult(true);
      }
    }
    return new ChallengeResult(false);
  }

  public ChallengesReader playerChallenges(String exerciseId, User user) {
    Exercise exercise =
        exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
    ChallengesReader reader = new ChallengesReader(exercise);
    List<InjectExpectation> challengeExpectations =
        injectExpectationRepository.findChallengeExpectationsByExerciseAndUser(
            exerciseId, user.getId());

    // Filter expectations by unique challenge
    Set<String> seenChallenges = new HashSet<>();
    List<InjectExpectation> distinctExpectations = new ArrayList<>();

    for (InjectExpectation expectation : challengeExpectations) {
      String challengeId = expectation.getChallenge().getId();
      if (!seenChallenges.contains(challengeId)) {
        seenChallenges.add(challengeId);
        distinctExpectations.add(expectation);
      }
    }

    List<ChallengeInformation> challenges =
        distinctExpectations.stream()
            .map(
                injectExpectation -> {
                  Challenge challenge = injectExpectation.getChallenge();
                  challenge.setVirtualPublication(injectExpectation.getCreatedAt());
                  InjectStatus injectStatus =
                      injectExpectation.getInject().getStatus().orElseThrow();
                  ChallengeAttemptId challengeAttemptId =
                      challengeAttemptId(challenge.getId(), injectStatus.getId(), user.getId());
                  ChallengeAttempt challengeAttempt =
                      this.challengeAttemptService
                          .challengeAttempt(challengeAttemptId)
                          .orElse(challengeAttempt(challengeAttemptId));
                  return new ChallengeInformation(
                      challenge, injectExpectation, challengeAttempt.getAttempt());
                })
            .sorted(Comparator.comparing(o -> o.getChallenge().getVirtualPublication()))
            .toList();
    reader.setExerciseChallenges(challenges);
    return reader;
  }

  public ChallengesReader validateChallenge(
      String exerciseId, String challengeId, ChallengeTryInput input, User user) {
    ChallengeResult challengeResult = tryChallenge(challengeId, input);
    if (challengeResult.isResult()) {
      // Find and update the expectations linked to the user
      List<InjectExpectation> playerExpectations =
          injectExpectationRepository.findByUserAndExerciseAndChallenge(
              user.getId(), exerciseId, challengeId);
      playerExpectations.forEach(
          playerExpectation -> {
            InjectStatus injectStatus = playerExpectation.getInject().getStatus().orElseThrow();
            ChallengeAttemptId challengeAttemptId =
                challengeAttemptId(challengeId, injectStatus.getId(), user.getId());
            ChallengeAttempt challengeAttempt =
                this.challengeAttemptService
                    .challengeAttempt(challengeAttemptId)
                    .orElse(challengeAttempt(challengeAttemptId));
            double score =
                challengeAttempt.getAttempt() < playerExpectation.getChallenge().getMaxAttempts()
                    ? playerExpectation.getExpectedScore()
                    : 0;

            ExpectationUpdateInput expectationUpdateInput = buildChallengeUpdateInput(score);
            this.injectExpectationService.updateInjectExpectation(
                playerExpectation.getId(), expectationUpdateInput);

            // Clean attempt
            this.challengeAttemptService.deleteChallengeAttempt(challengeAttemptId);
          });
    } else {
      List<InjectExpectation> playerExpectations =
          injectExpectationRepository.findByUserAndExerciseAndChallenge(
              user.getId(), exerciseId, challengeId);
      playerExpectations.forEach(
          playerExpectation -> {
            InjectStatus injectStatus = playerExpectation.getInject().getStatus().orElseThrow();
            ChallengeAttemptId challengeAttemptId =
                challengeAttemptId(challengeId, injectStatus.getId(), user.getId());
            ChallengeAttempt challengeAttempt =
                this.challengeAttemptService
                    .challengeAttempt(challengeAttemptId)
                    .orElse(challengeAttempt(challengeAttemptId));
            challengeAttempt.setAttempt(challengeAttempt.getAttempt() + 1);
            challengeAttemptService.saveChallengeAttempt(challengeAttempt);
            if (challengeAttempt.getAttempt()
                >= playerExpectation.getChallenge().getMaxAttempts()) {
              ExpectationUpdateInput expectationUpdateInput = buildChallengeUpdateInput(0D);
              this.injectExpectationService.updateInjectExpectation(
                  playerExpectation.getId(), expectationUpdateInput);
            }
          });
    }
    return playerChallenges(exerciseId, user);
  }

  // -- PRIVATE --
  private Stream<Challenge> resolveChallenges(@NotNull final List<Inject> injects) {
    List<String> challenges =
        injects.stream()
            .filter(
                inject ->
                    inject
                        .getInjectorContract()
                        .map(contract -> contract.getId().equals(CHALLENGE_PUBLISH))
                        .orElse(false))
            .filter(inject -> inject.getContent() != null)
            .flatMap(
                inject -> {
                  try {
                    ChallengeContent content =
                        mapper.treeToValue(inject.getContent(), ChallengeContent.class);
                    return content.getChallenges().stream();
                  } catch (JsonProcessingException e) {
                    return Stream.empty();
                  }
                })
            .distinct()
            .toList();

    return fromIterable(this.challengeRepository.findAllById(challenges)).stream();
  }

  private boolean checkFlag(ChallengeFlag flag, String value) {
    switch (flag.getType()) {
      case VALUE -> {
        return value.equalsIgnoreCase(flag.getValue());
      }
      case VALUE_CASE -> {
        return value.equals(flag.getValue());
      }
      case REGEXP -> {
        return Pattern.compile(flag.getValue()).matcher(value).matches();
      }
      default -> {
        return false;
      }
    }
  }
}
