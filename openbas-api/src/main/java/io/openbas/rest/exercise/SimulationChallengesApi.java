package io.openbas.rest.exercise;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.openbas.database.model.*;
import io.openbas.database.repository.ChallengeRepository;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.injectors.challenge.model.ChallengeContent;
import io.openbas.rest.challenge.response.ChallengeInformation;
import io.openbas.rest.challenge.response.SimulationChallengesReader;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.ChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static io.openbas.config.OpenBASAnonymous.ANONYMOUS;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.injectors.challenge.ChallengeContract.CHALLENGE_PUBLISH;

@RestController
@RequiredArgsConstructor
public class SimulationChallengesApi extends RestBehavior {

  private ExerciseRepository exerciseRepository;
  private UserRepository userRepository;
  private ChallengeRepository challengeRepository;
  private final ChallengeService challengeService;

  @Autowired
  public void setChallengeRepository(ChallengeRepository challengeRepository) {
    this.challengeRepository = challengeRepository;
  }

  @Autowired
  public void setExerciseRepository(ExerciseRepository exerciseRepository) {
    this.exerciseRepository = exerciseRepository;
  }

  @Autowired
  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  private List<Document> getPlayerDocuments(List<Article> articles, List<Inject> injects) {
    Stream<Document> channelsDocs =
        articles.stream().map(Article::getChannel).flatMap(channel -> channel.getLogos().stream());
    Stream<Document> articlesDocs =
        articles.stream().flatMap(article -> article.getDocuments().stream());
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
            .toList();
    Stream<Document> challengesDocs =
        fromIterable(challengeRepository.findAllById(challenges)).stream()
            .flatMap(challenge -> challenge.getDocuments().stream());
    return Stream.of(channelsDocs, articlesDocs, challengesDocs)
        .flatMap(documentStream -> documentStream)
        .distinct()
        .toList();
  }

  private List<Document> getExercisePlayerDocuments(Exercise exercise) {
    List<Article> articles = exercise.getArticles();
    List<Inject> injects = exercise.getInjects();
    return getPlayerDocuments(articles, injects);
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
      return getExercisePlayerDocuments(exerciseOpt.get());
    } else {
      throw new IllegalArgumentException("Simulation ID not found");
    }
  }

  @GetMapping("/api/observer/simulations/{simulationId}/challenges")
  public SimulationChallengesReader observerChallenges(@PathVariable String simulationId) {
    Exercise exercise =
        exerciseRepository.findById(simulationId).orElseThrow(ElementNotFoundException::new);
    SimulationChallengesReader simulationChallengesReader = new SimulationChallengesReader(exercise);
    Iterable<Challenge> challenges = challengeService.getExerciseChallenges(simulationId);
    simulationChallengesReader.setExerciseChallenges(
        fromIterable(challenges).stream()
            .map(challenge -> new ChallengeInformation(challenge, null, 0))
            .toList());
    return simulationChallengesReader;
  }

}
