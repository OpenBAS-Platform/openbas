package io.openbas.rest.challenge;

import io.openbas.database.model.Challenge;
import io.openbas.database.model.ChallengeFlag;
import io.openbas.database.model.ChallengeFlag.FLAG_TYPE;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.User;
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
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static io.openbas.config.OpenBASAnonymous.ANONYMOUS;
import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;

@RestController
@RequiredArgsConstructor
public class ChallengeApi extends RestBehavior {

    private final ChallengeRepository challengeRepository;
    private final ChallengeFlagRepository challengeFlagRepository;
    private final TagRepository tagRepository;
    private final DocumentRepository documentRepository;
    private final ExerciseRepository exerciseRepository;
    private final ChallengeService challengeService;
    private final UserRepository userRepository;

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
        challenge.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
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
        challenge.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
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

    @GetMapping("/api/player/challenges/{exerciseId}")
    public ChallengesReader playerChallenges(@PathVariable String exerciseId, @RequestParam Optional<String> userId) {
        final User user = impersonateUser(userRepository, userId);
        if (user.getId().equals(ANONYMOUS)) {
            throw new UnsupportedOperationException("User must be logged or dynamic player is required");
        }
        return challengeService.playerChallenges(exerciseId, user);
    }

    @GetMapping("/api/observer/challenges/{exerciseId}")
    public ChallengesReader observerChallenges(@PathVariable String exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        ChallengesReader challengesReader = new ChallengesReader(exercise);
        Iterable<Challenge> challenges = challengeService.getExerciseChallenges(exerciseId);
        challengesReader.setExerciseChallenges(fromIterable(challenges).stream()
                .map(challenge -> new ChallengeInformation(challenge, null)).toList());
        return challengesReader;
    }

    @Secured(ROLE_ADMIN)
    @DeleteMapping("/api/challenges/{challengeId}")
    @Transactional(rollbackOn = Exception.class)
    public void deleteChallenge(@PathVariable String challengeId) {
        challengeRepository.deleteById(challengeId);
    }

    @PostMapping("/api/challenges/{challengeId}/try")
    public ChallengeResult tryChallenge(@PathVariable String challengeId, @Valid @RequestBody ChallengeTryInput input) {
        return challengeService.tryChallenge(challengeId, input);
    }

    @PostMapping("/api/player/challenges/{exerciseId}/{challengeId}/validate")
    @Transactional(rollbackOn = Exception.class)
    public ChallengesReader validateChallenge(@PathVariable String exerciseId,
                                              @PathVariable String challengeId,
                                              @Valid @RequestBody ChallengeTryInput input,
                                              @RequestParam Optional<String> userId) {
        final User user = impersonateUser(userRepository, userId);
        if (user.getId().equals(ANONYMOUS)) {
            throw new UnsupportedOperationException("User must be logged or dynamic player is required");
        }
        return challengeService.validateChallenge(exerciseId, challengeId, input, user);
    }
}
