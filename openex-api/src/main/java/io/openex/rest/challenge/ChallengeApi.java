package io.openex.rest.challenge;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.openex.database.model.Challenge;
import io.openex.database.model.ChallengeFlag;
import io.openex.database.model.ChallengeFlag.FLAG_TYPE;
import io.openex.database.model.Exercise;
import io.openex.database.model.Inject;
import io.openex.database.repository.*;
import io.openex.injects.challenge.model.ChallengeContent;
import io.openex.rest.challenge.form.ChallengeCreateInput;
import io.openex.rest.challenge.form.ChallengeUpdateInput;
import io.openex.rest.challenge.response.ChallengesReader;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.media.model.VirtualArticle;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.transaction.Transactional;
import javax.validation.Valid;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
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
    private InjectRepository injectRepository;

    @Autowired
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
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

    private Challenge enrichChallengeWithExercises(Challenge challenge) {
        List<Inject> injects = fromIterable(injectRepository
                .findAllForChallengeId("%" + challenge.getId() + "%"));
        List<String> exerciseIds = injects.stream().map(i -> i.getExercise().getId()).distinct().toList();
        challenge.setExerciseIds(exerciseIds);
        return challenge;
    }

    @GetMapping("/api/challenges")
    public Iterable<Challenge> challenges() {
        return fromIterable(challengeRepository.findAll()).stream()
                .map(this::enrichChallengeWithExercises).toList();
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
        Challenge saveChallenge = challengeRepository.save(challenge);
        return enrichChallengeWithExercises(saveChallenge);
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
                .filter(inject -> inject.getContent() != null)
                .flatMap(inject -> {
                    try {
                        ChallengeContent content = mapper.treeToValue(inject.getContent(), ChallengeContent.class);
                        return content.getChallenges().stream();
                    } catch (JsonProcessingException e) {
                        return Stream.empty();
                    }
                })
                .distinct().toList();
        return fromIterable(challengeRepository.findAllById(challenges)).stream()
                .map(this::enrichChallengeWithExercises).toList();
    }

    @GetMapping("/api/player/challenges/{exerciseId}")
    public ChallengesReader playerChallenges(@PathVariable String exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        ChallengesReader reader = new ChallengesReader(exercise);
        Map<String, Instant> toPublishChallengeIdsMap = exercise.getInjects().stream()
                .filter(inject -> inject.getContract().equals(CHALLENGE_PUBLISH))
                .filter(inject -> inject.getStatus().isPresent())
                .sorted(Comparator.comparing(inject -> inject.getStatus().get().getDate()))
                .flatMap(inject -> {
                    Instant virtualInjectDate = inject.getStatus().get().getDate();
                    try {
                        ChallengeContent content = mapper.treeToValue(inject.getContent(), ChallengeContent.class);
                        if (content.getChallenges() != null) {
                            return content.getChallenges().stream().map(
                                    challenge -> new VirtualArticle(virtualInjectDate, challenge));
                        }
                        return null;
                    } catch (JsonProcessingException e) {
                        // Invalid media content.
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toMap(VirtualArticle::id, VirtualArticle::date));
        if (toPublishChallengeIdsMap.size() > 0) {
            List<Challenge> publishedChallenges = fromIterable(challengeRepository.findAllById(toPublishChallengeIdsMap.keySet())).stream()
                    .peek(challenge -> challenge.setVirtualPublication(toPublishChallengeIdsMap.get(challenge.getId())))
                    .sorted(Comparator.comparing(Challenge::getVirtualPublication).reversed())
                    .toList();
            reader.setExerciseChallenges(publishedChallenges);
        }
        return reader;
    }

    @GetMapping("/api/observer/challenges/{exerciseId}")
    public ChallengesReader observerChallenges(@PathVariable String exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        ChallengesReader challengesReader = new ChallengesReader(exercise);
        Iterable<Challenge> challenges = exerciseChallenges(exerciseId);
        challengesReader.setExerciseChallenges(fromIterable(challenges));
        return challengesReader;
    }

    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/challenges/{challengeId}")
    public void deleteChallenge(@PathVariable String challengeId) {
        challengeRepository.deleteById(challengeId);
    }
}