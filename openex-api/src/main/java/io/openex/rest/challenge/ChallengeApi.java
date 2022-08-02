package io.openex.rest.challenge;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.openex.database.model.Challenge;
import io.openex.database.model.ChallengeFlag;
import io.openex.database.model.ChallengeFlag.FLAG_TYPE;
import io.openex.database.model.Exercise;
import io.openex.database.repository.*;
import io.openex.injects.challenge.model.ChallengeContent;
import io.openex.rest.challenge.form.ChallengeCreateInput;
import io.openex.rest.challenge.form.ChallengeUpdateInput;
import io.openex.rest.challenge.response.ChallengesReader;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.transaction.Transactional;
import javax.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.stream.Stream;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.helper.StreamHelper.fromIterable;
import static io.openex.injects.challenge.ChallengeContract.CHALLENGE_PUBLISH;

@RestController
public class ChallengeApi extends RestBehavior {

    private ChallengeRepository challengeRepository;
    private ChallengeFlagRepository challengeFlagRepository;
    private TagRepository tagRepository;
    private DocumentRepository documentRepository;
    private ExerciseRepository exerciseRepository;

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

    @GetMapping("/api/challenges")
    public Iterable<Challenge> challenges() {
        return challengeRepository.findAll();
    }

    @PreAuthorize("isPlanner()")
    @PutMapping("/api/challenges/{challengeId}")
    @Transactional(rollbackOn = Exception.class)
    public Challenge updateChallenge(@PathVariable String challengeId,
                                     @Valid @RequestBody ChallengeUpdateInput input) {
        Challenge challenge = challengeRepository.findById(challengeId).orElseThrow();
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
        return challengeRepository.save(challenge);
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
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        List<String> challenges = exercise.getInjects().stream()
                .filter(inject -> inject.getContract().equals(CHALLENGE_PUBLISH))
                .flatMap(inject -> {
                    try {
                        ChallengeContent content = mapper.treeToValue(inject.getContent(), ChallengeContent.class);
                        return content.getChallengeIds().stream();
                    } catch (JsonProcessingException e) {
                        return Stream.empty();
                    }
                })
                .distinct().toList();
        return challengeRepository.findAllById(challenges);
    }

    @GetMapping("/api/player/challenges/{exerciseId}")
    public ChallengesReader playerChallenges(@PathVariable String exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        List<String> challengesIds = exercise.getInjects().stream()
                .filter(inject -> inject.getContract().equals(CHALLENGE_PUBLISH))
                .flatMap(inject -> {
                    try {
                        ChallengeContent content = mapper.treeToValue(inject.getContent(), ChallengeContent.class);
                        if (content.getChallengeIds() != null) {
                            return content.getChallengeIds().stream();
                        }
                        return Stream.empty();
                    } catch (JsonProcessingException e) {
                        return Stream.empty();
                    }
                })
                .distinct().toList();
        ChallengesReader challengesReader = new ChallengesReader(exercise);
        challengesReader.setExerciseChallenges(fromIterable(challengeRepository.findAllById(challengesIds)));
        return challengesReader;
    }

    @GetMapping("/api/observer/challenges/{exerciseId}")
    public ChallengesReader observerChallenges(@PathVariable String exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        List<String> challengesIds = exercise.getInjects().stream()
                .filter(inject -> inject.getContract().equals(CHALLENGE_PUBLISH))
                .flatMap(inject -> {
                    try {
                        ChallengeContent content = mapper.treeToValue(inject.getContent(), ChallengeContent.class);
                        if (content.getChallengeIds() != null) {
                            return content.getChallengeIds().stream();
                        }
                        return Stream.empty();
                    } catch (JsonProcessingException e) {
                        return Stream.empty();
                    }
                })
                .distinct().toList();
        ChallengesReader challengesReader = new ChallengesReader(exercise);
        challengesReader.setExerciseChallenges(fromIterable(challengeRepository.findAllById(challengesIds)));
        return challengesReader;
    }

    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/challenges/{challengeId}")
    public void deleteChallenge(@PathVariable String challengeId) {
        challengeRepository.deleteById(challengeId);
    }

}