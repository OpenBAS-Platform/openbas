package io.openex.rest.attack_pattern;

import io.openex.database.model.AttackPattern;
import io.openex.database.repository.AttackPatternRepository;
import io.openex.rest.attack_pattern.form.AttackPatternCreateInput;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.database.model.User.ROLE_USER;

@RestController
@RolesAllowed(ROLE_USER)
public class AttackPatternApi extends RestBehavior {

    private AttackPatternRepository attackPatternRepository;

    @Autowired
    public void setAttackPatternRepository(AttackPatternRepository attackPatternRepository) {
        this.attackPatternRepository = attackPatternRepository;
    }

    @GetMapping("/api/attack_patterns")
    public Iterable<AttackPattern> attackPatterns() {
        return attackPatternRepository.findAll();
    }

    @GetMapping("/api/attack_patterns/{attackPatternId}")
    public AttackPattern attackPattern(@PathVariable String attackPatternId) {
        return attackPatternRepository.findById(attackPatternId).orElseThrow();
    }

    @RolesAllowed(ROLE_ADMIN)
    @PostMapping("/api/attack_patterns")
    public AttackPattern createAttackPattern(@Valid @RequestBody AttackPatternCreateInput input) {
        AttackPattern attackPattern = new AttackPattern();
        attackPattern.setUpdateAttributes(input);
        attackPattern.setParent(attackPatternRepository.findById(input.getParentId()).orElseThrow());
        return attackPatternRepository.save(attackPattern);
    }

    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/attack_patterns/{attackPatternId}")
    public void deleteAttackPattern(@PathVariable String attackPatternId) {
        attackPatternRepository.deleteById(attackPatternId);
    }
}
