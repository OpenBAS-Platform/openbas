package io.openbas.rest.challenge;

import io.openbas.database.model.*;
import io.openbas.database.model.ChallengeFlag.FLAG_TYPE;
import io.openbas.database.repository.*;
import io.openbas.rest.challenge.form.ChallengeCreateInput;
import io.openbas.rest.challenge.form.ChallengeTryInput;
import io.openbas.rest.challenge.form.ChallengeUpdateInput;
import io.openbas.rest.challenge.response.ChallengeInformation;
import io.openbas.rest.challenge.response.ChallengeResult;
import io.openbas.rest.challenge.response.ChallengesReader;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.ChallengeService;
import io.openbas.service.ScenarioService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

import static io.openbas.config.OpenBASAnonymous.ANONYMOUS;
import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;

@RestController
public class ChallengeApi extends RestBehavior {

  private ChallengeRepository challengeRepository;
  private ChallengeFlagRepository challengeFlagRepository;
  private TagRepository tagRepository;
  private DocumentRepository documentRepository;
  private ExerciseRepository exerciseRepository;
  private InjectExpectationRepository injectExpectationRepository;
  private ChallengeService challengeService;
  private UserRepository userRepository;
  private ScenarioService scenarioService;

  @Autowired
  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Autowired
  public void setChallengeService(ChallengeService challengeService) {
    this.challengeService = challengeService;
  }

  @Autowired
  public void setInjectExpectationRepository(InjectExpectationRepository injectExpectationRepository) {
    this.injectExpectationRepository = injectExpectationRepository;
  }

  @Autowired
  public void setChallengeFlagRepository(ChallengeFlagRepository challengeFlagRepository) {
    this.challengeFlagRepository = challengeFlagRepository;
  }

  @Autowired
  public void setChallengeRepository(ChallengeRepository challengeRepository) {
    this.challengeRepository = challengeRepository;
  }

  @Autowired
  public void setTagRepository(TagRepository tagRepository) {
    this.tagRepository = tagRepository;
  }

  @Autowired
  public void setDocumentRepository(DocumentRepository documentRepository) {
    this.documentRepository = documentRepository;
  }

  @Autowired
  public void setExerciseRepository(ExerciseRepository exerciseRepository) {
    this.exerciseRepository = exerciseRepository;
  }

  @Autowired
  public void setScenarioService(final ScenarioService scenarioService) {
    this.scenarioService = scenarioService;
  }

  @GetMapping("/api/challenges")
  public Iterable<Challenge> challenges() {
    return fromIterable(challengeRepository.findAll()).stream()
        .map(challengeService::enrichChallengeWithExercisesOrScenarios).toList();
  }

  @PreAuthorize("isPlanner()")
  @PutMapping("/api/challenges/{challengeId}")
  @Transactional(rollbackOn = Exception.class)
  public Challenge updateChallenge(
      @PathVariable String challengeId,
      @Valid @RequestBody ChallengeUpdateInput input) {
    Challenge challenge = challengeRepository.findById(challengeId).orElseThrow(ElementNotFoundException::new);
    challenge.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    challenge.setDocuments(fromIterable(documentRepository.findAllById(input.getDocumentIds())));
    challenge.setUpdateAttributes(input);
    challenge.setUpdatedAt(Instant.now());
    // Clear all flags
    List<ChallengeFlag> challengeFlags = challenge.getFlags();
    challengeFlagRepository.deleteAll(challengeFlags);
    challengeFlags.clear();
    // Add new ones
    input.getFlags().forEach(flagInput -> {
      ChallengeFlag challengeFlag = new ChallengeFlag();
      challengeFlag.setType(FLAG_TYPE.valueOf(flagInput.getType()));
      challengeFlag.setValue(flagInput.getValue());
      challengeFlag.setChallenge(challenge);
      challengeFlags.add(challengeFlag);
    });
    Challenge saveChallenge = challengeRepository.save(challenge);
    return challengeService.enrichChallengeWithExercisesOrScenarios(saveChallenge);
  }

  @PreAuthorize("isPlanner()")
  @PostMapping("/api/challenges")
  @Transactional(rollbackOn = Exception.class)
  public Challenge createChallenge(@Valid @RequestBody ChallengeCreateInput input) {
    Challenge challenge = new Challenge();
    challenge.setUpdateAttributes(input);
    challenge.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    challenge.setDocuments(fromIterable(documentRepository.findAllById(input.getDocumentIds())));
    List<ChallengeFlag> challengeFlags = input.getFlags().stream().map(flagInput -> {
      ChallengeFlag challengeFlag = new ChallengeFlag();
      challengeFlag.setType(FLAG_TYPE.valueOf(flagInput.getType()));
      challengeFlag.setValue(flagInput.getValue());
      challengeFlag.setChallenge(challenge);
      return challengeFlag;
    }).toList();
    challenge.setFlags(challengeFlags);
    return challengeRepository.save(challenge);
  }

  @PreAuthorize("isExerciseObserver(#exerciseId)")
  @GetMapping("/api/exercises/{exerciseId}/challenges")
  public Iterable<Challenge> exerciseChallenges(@PathVariable String exerciseId) {
    return challengeService.getExerciseChallenges(exerciseId);
  }

  @GetMapping("/api/player/challenges/{exerciseId}")
  public ChallengesReader playerChallenges(@PathVariable String exerciseId, @RequestParam Optional<String> userId) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
    final User user = impersonateUser(userRepository, userId);
    if (user.getId().equals(ANONYMOUS)) {
      throw new UnsupportedOperationException("User must be logged or dynamic player is required");
    }
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

  @GetMapping("/api/observer/challenges/{exerciseId}")
  public ChallengesReader observerChallenges(@PathVariable String exerciseId) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
    ChallengesReader challengesReader = new ChallengesReader(exercise);
    Iterable<Challenge> challenges = exerciseChallenges(exerciseId);
    challengesReader.setExerciseChallenges(fromIterable(challenges).stream()
        .map(challenge -> new ChallengeInformation(challenge, null)).toList());
    return challengesReader;
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping("/api/challenges/{challengeId}")
  public void deleteChallenge(@PathVariable String challengeId) {
    challengeRepository.deleteById(challengeId);
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

  @PostMapping("/api/challenges/{challengeId}/try")
  public ChallengeResult tryChallenge(@PathVariable String challengeId, @Valid @RequestBody ChallengeTryInput input) {
    Challenge challenge = challengeRepository.findById(challengeId).orElseThrow(ElementNotFoundException::new);
    for (ChallengeFlag flag : challenge.getFlags()) {
      if (checkFlag(flag, input.getValue())) {
        return new ChallengeResult(true);
      }
    }
    return new ChallengeResult(false);
  }

  @PostMapping("/api/player/challenges/{exerciseId}/{challengeId}/validate")
  public ChallengesReader validateChallenge(@PathVariable String exerciseId,
      @PathVariable String challengeId,
      @Valid @RequestBody ChallengeTryInput input,
      @RequestParam Optional<String> userId) {
    final User user = impersonateUser(userRepository, userId);
    if (user.getId().equals(ANONYMOUS)) {
      throw new UnsupportedOperationException("User must be logged or dynamic player is required");
    }
    ChallengeResult challengeResult = tryChallenge(challengeId, input);
    if (challengeResult.getResult()) {
      List<String> teamIds = user.getTeams().stream().map(Team::getId).toList();
      List<InjectExpectation> challengeExpectations = injectExpectationRepository.findChallengeExpectations(exerciseId,
          teamIds, challengeId);
      challengeExpectations.forEach(injectExpectationExecution -> {
        injectExpectationExecution.setUser(user);
        injectExpectationExecution.setResults(List.of(
            InjectExpectationResult.builder().result(Instant.now().toString()).build()
        ));
        injectExpectationExecution.setScore(injectExpectationExecution.getExpectedScore());
        injectExpectationExecution.setUpdatedAt(Instant.now());
        injectExpectationRepository.save(injectExpectationExecution);
      });
    }
    return playerChallenges(exerciseId, userId);
  }

  // -- SCENARIOS --

  @PreAuthorize("isScenarioObserver(#scenarioId)")
  @GetMapping(SCENARIO_URI + "/{scenarioId}/challenges")
  public Iterable<Challenge> scenarioChallenges(@PathVariable @NotBlank final String scenarioId) {
    Scenario scenario = this.scenarioService.scenario(scenarioId);
    return this.challengeService.getScenarioChallenges(scenario);
  }

}
