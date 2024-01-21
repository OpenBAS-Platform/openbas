package io.openex.rest.attack_pattern;

import io.openex.database.model.AttackPattern;
import io.openex.database.repository.AttackPatternRepository;
import io.openex.database.repository.KillChainPhaseRepository;
import io.openex.rest.attack_pattern.form.AttackPatternCreateInput;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.database.model.User.ROLE_USER;
import static io.openex.helper.DatabaseHelper.updateRelation;
import static io.openex.helper.StreamHelper.fromIterable;

@RestController
@Secured(ROLE_USER)
public class AttackPatternApi extends RestBehavior {

    private AttackPatternRepository attackPatternRepository;
    private KillChainPhaseRepository killChainPhaseRepository;

    @Autowired
    public void setAttackPatternRepository(AttackPatternRepository attackPatternRepository) {
        this.attackPatternRepository = attackPatternRepository;
    }

    @Autowired
    public void setKillChainPhaseRepository(KillChainPhaseRepository killChainPhaseRepository) {
        this.killChainPhaseRepository = killChainPhaseRepository;
    }

    @GetMapping("/api/attack_patterns")
    public Iterable<AttackPattern> attackPatterns() {
        return attackPatternRepository.findAll();
    }

    @GetMapping("/api/attack_patterns/{attackPatternId}")
    public AttackPattern attackPattern(@PathVariable String attackPatternId) {
        return attackPatternRepository.findById(attackPatternId).orElseThrow();
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/attack_patterns")
    public AttackPattern createAttackPattern(@Valid @RequestBody AttackPatternCreateInput input) {
        AttackPattern attackPattern = new AttackPattern();
        attackPattern.setUpdateAttributes(input);
        attackPattern.setKillChainPhases(fromIterable(killChainPhaseRepository.findAllById(input.getKillChainPhasesIds())));
        attackPattern.setParent(updateRelation(input.getParentId(), attackPattern.getParent(), attackPatternRepository));
        return attackPatternRepository.save(attackPattern);
    }

    @Secured(ROLE_ADMIN)
    @DeleteMapping("/api/attack_patterns/{attackPatternId}")
    public void deleteAttackPattern(@PathVariable String attackPatternId) {
        attackPatternRepository.deleteById(attackPatternId);
    }
}
