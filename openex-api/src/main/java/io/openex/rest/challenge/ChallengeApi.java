package io.openex.rest.challenge;

import io.openex.database.model.Challenge;
import io.openex.database.model.ChallengeFlag;
import io.openex.database.model.ChallengeFlag.FLAG_TYPE;
import io.openex.database.repository.ChallengeFlagRepository;
import io.openex.database.repository.ChallengeRepository;
import io.openex.rest.challenge.form.ChallengeCreateInput;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.transaction.Transactional;
import javax.validation.Valid;
import java.util.List;

import static io.openex.database.model.User.ROLE_ADMIN;

@RestController
public class ChallengeApi extends RestBehavior {

    private ChallengeRepository challengeRepository;
    private ChallengeFlagRepository challengeFlagRepository;

    @Autowired
    public void setChallengeFlagRepository(ChallengeFlagRepository challengeFlagRepository) {
        this.challengeFlagRepository = challengeFlagRepository;
    }

    @Autowired
    public void setChallengeRepository(ChallengeRepository challengeRepository) {
        this.challengeRepository = challengeRepository;
    }

    @GetMapping("/api/challenges")
    public Iterable<Challenge> medias() {
        return challengeRepository.findAll();
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/challenges/{challengeId}")
    @Transactional(rollbackOn = Exception.class)
    public Challenge updateChallenge(@PathVariable String challengeId,
                                     @Valid @RequestBody ChallengeCreateInput input) {
        Challenge challenge = challengeRepository.findById(challengeId).orElseThrow();
        challenge.setUpdateAttributes(input);
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

    @RolesAllowed(ROLE_ADMIN)
    @PostMapping("/api/challenges")
    @Transactional(rollbackOn = Exception.class)
    public Challenge createChallenge(@Valid @RequestBody ChallengeCreateInput input) {
        Challenge challenge = new Challenge();
        challenge.setUpdateAttributes(input);
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