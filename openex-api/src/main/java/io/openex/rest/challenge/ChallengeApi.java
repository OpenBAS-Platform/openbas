package io.openex.rest.challenge;

import io.openex.database.model.Challenge;
import io.openex.database.model.ChallengeFlag;
import io.openex.database.model.ChallengeFlag.FLAG_TYPE;
import io.openex.database.repository.ChallengeFlagRepository;
import io.openex.database.repository.ChallengeRepository;
import io.openex.database.repository.DocumentRepository;
import io.openex.database.repository.TagRepository;
import io.openex.rest.challenge.form.ChallengeCreateInput;
import io.openex.rest.challenge.form.ChallengeUpdateInput;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.transaction.Transactional;
import javax.validation.Valid;
import java.time.Instant;
import java.util.List;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.helper.StreamHelper.fromIterable;

@RestController
public class ChallengeApi extends RestBehavior {

    private ChallengeRepository challengeRepository;
    private ChallengeFlagRepository challengeFlagRepository;
    private TagRepository tagRepository;
    private DocumentRepository documentRepository;

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

    @GetMapping("/api/challenges")
    public Iterable<Challenge> medias() {
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

    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/challenges/{challengeId}")
    public void deleteChallenge(@PathVariable String challengeId) {
        challengeRepository.deleteById(challengeId);
    }

}