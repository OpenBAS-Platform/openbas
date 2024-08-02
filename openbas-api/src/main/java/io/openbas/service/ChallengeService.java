package io.openbas.service;

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
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.injectors.challenge.ChallengeContract.CHALLENGE_PUBLISH;

@Service
@AllArgsConstructor
public class ChallengeService {

    @Resource
    protected ObjectMapper mapper;

    private ExerciseRepository exerciseRepository;
    private ChallengeRepository challengeRepository;
    private InjectRepository injectRepository;
    private InjectExpectationRepository injectExpectationRepository;

    public Challenge enrichChallengeWithExercisesOrScenarios(@NotNull Challenge challenge) {
        List<Inject> injects = fromIterable(this.injectRepository.findAllForChallengeId("%" + challenge.getId() + "%"));
        List<String> exerciseIds = injects.stream().filter(i -> i.getExercise() != null).map(i -> i.getExercise().getId()).distinct().toList();
        challenge.setExerciseIds(exerciseIds);
        List<String> scenarioIds = injects.stream().filter(i -> i.getScenario() != null).map(i -> i.getScenario().getId()).distinct().toList();
        challenge.setScenarioIds(scenarioIds);
        return challenge;
    }

    public Iterable<Challenge> getExerciseChallenges(@NotBlank final String exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        return resolveChallenges(exercise.getInjects())
                .map(this::enrichChallengeWithExercisesOrScenarios)
                .toList();
    }

    public Iterable<Challenge> getScenarioChallenges(@NotNull final Scenario scenario) {
        return resolveChallenges(scenario.getInjects())
                .map(this::enrichChallengeWithExercisesOrScenarios)
                .toList();
    }


    public ChallengeResult tryChallenge(String challengeId, ChallengeTryInput input) {
        Challenge challenge = challengeRepository.findById(challengeId).orElseThrow(ElementNotFoundException::new);
        for (ChallengeFlag flag : challenge.getFlags()) {
            if (checkFlag(flag, input.getValue())) {
                return new ChallengeResult(true);
            }
        }
        return new ChallengeResult(false);
    }

    public ChallengesReader playerChallenges(String exerciseId, User user) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        ChallengesReader reader = new ChallengesReader(exercise);
        List<String> teamIds = user.getTeams().stream().map(Team::getId).toList();
        List<InjectExpectation> challengeExpectations = injectExpectationRepository.findChallengeExpectations(exerciseId,
                teamIds);
        List<ChallengeInformation> challenges = challengeExpectations.stream()
                .map(injectExpectation -> {
                    Challenge challenge = injectExpectation.getChallenge();
                    challenge.setVirtualPublication(injectExpectation.getCreatedAt());
                    return new ChallengeInformation(challenge, injectExpectation);
                })
                .sorted(Comparator.comparing(o -> o.getChallenge().getVirtualPublication()))
                .toList();
        reader.setExerciseChallenges(challenges);
        return reader;
    }

    public ChallengesReader validateChallenge(String exerciseId,
                                              String challengeId,
                                              ChallengeTryInput input,
                                              User user) {
        ChallengeResult challengeResult = tryChallenge(challengeId, input);
        if (challengeResult.getResult()) {

            // Find and update the expectations linked to user
            List<InjectExpectation> playerExpectations = injectExpectationRepository.findByUserAndExerciseAndChallenge(user.getId(), exerciseId, challengeId);
            playerExpectations.forEach(playerExpectation -> {
                playerExpectation.setScore(playerExpectation.getExpectedScore());
                InjectExpectationResult expectationResult = InjectExpectationResult.builder()
                        .sourceId("challenge")
                        .sourceType("challenge")
                        .sourceName("Challenge validation")
                        .result(Instant.now().toString())
                        .date(Instant.now().toString())
                        .score(playerExpectation.getExpectedScore())
                        .build();
                playerExpectation.getResults().add(expectationResult);
                playerExpectation.setUpdatedAt(Instant.now());
                injectExpectationRepository.save(playerExpectation);
            });

            // Process expectation linked to teams where user if part of
            List<String> teamIds = user.getTeams().stream().map(Team::getId).toList();
            // Find all expectations linked to teams' user, challenge and exercise
            List<InjectExpectation> challengeExpectations = injectExpectationRepository.findChallengeExpectations(exerciseId, teamIds, challengeId);

            // Depending on type of validation, we process the parent expectations:
            challengeExpectations.stream().findAny().ifPresentOrElse(process -> {
                boolean validationType = process.isExpectationGroup();

                challengeExpectations.forEach(parentExpectation -> {
                    if (validationType) { // type atLeast
                        parentExpectation.setScore(injectExpectationRepository.computeAverageScoreWhenValidationTypeIsAtLeastOnePlayerForChallenge(
                                process.getExercise().getId(),
                                process.getChallenge().getId(),
                                parentExpectation.getTeam().getId())
                        );
                    } else { // type all
                        parentExpectation.setScore(injectExpectationRepository.computeAverageScoreWhenValidationTypeIsAllPlayersForChallenge(
                                process.getExercise().getId(),
                                process.getChallenge().getId(),
                                parentExpectation.getTeam().getId())
                        );
                    }
                    ;
                    InjectExpectationResult result = InjectExpectationResult.builder()
                            .sourceId("challenge")
                            .sourceType("challenge")
                            .sourceName("Challenge validation")
                            .result(Instant.now().toString())
                            .date(Instant.now().toString())
                            .score(process.getExpectedScore())
                            .build();

                    parentExpectation.getResults().add(result);
                    parentExpectation.setUpdatedAt(Instant.now());
                    injectExpectationRepository.save(parentExpectation);
                });
            }, ElementNotFoundException::new);
        }
        return playerChallenges(exerciseId, user);
    }

    // -- PRIVATE --
    private Stream<Challenge> resolveChallenges(@NotNull final List<Inject> injects) {
        List<String> challenges = injects.stream()
                .filter(inject -> inject.getInjectorContract()
                        .map(contract -> contract.getId().equals(CHALLENGE_PUBLISH))
                        .orElse(false))
                .filter(inject -> inject.getContent() != null)
                .flatMap(inject -> {
                    try {
                        ChallengeContent content = mapper.treeToValue(inject.getContent(), ChallengeContent.class);
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
