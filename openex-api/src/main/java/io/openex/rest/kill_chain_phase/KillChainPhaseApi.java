package io.openex.rest.kill_chain_phase;

import io.openex.database.model.KillChainPhase;
import io.openex.database.repository.KillChainPhaseRepository;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.kill_chain_phase.form.KillChainPhaseCreateInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.database.model.User.ROLE_USER;

@RestController
@Secured(ROLE_USER)
public class KillChainPhaseApi extends RestBehavior {

    private KillChainPhaseRepository killChainPhaseRepository;

    @Autowired
    public void setKillChainPhaseRepository(KillChainPhaseRepository killChainPhaseRepository) {
        this.killChainPhaseRepository = killChainPhaseRepository;
    }

    @GetMapping("/api/kill_chain_phases")
    public Iterable<KillChainPhase> killChainPhases() {
        return killChainPhaseRepository.findAll();
    }

    @GetMapping("/api/kill_chain_phases/{killChainPhaseId}")
    public KillChainPhase killChainPhase(@PathVariable String killChainPhaseId) {
        return killChainPhaseRepository.findById(killChainPhaseId).orElseThrow();
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/kill_chain_phases")
    public KillChainPhase createKillChainPhase(@Valid @RequestBody KillChainPhaseCreateInput input) {
        KillChainPhase killChainPhase = new KillChainPhase();
        killChainPhase.setUpdateAttributes(input);
        return killChainPhaseRepository.save(killChainPhase);
    }

    @Secured(ROLE_ADMIN)
    @DeleteMapping("/api/kill_chain_phases/{killChainPhaseId}")
    public void deleteKillChainPhase(@PathVariable String killChainPhaseId) {
        killChainPhaseRepository.deleteById(killChainPhaseId);
    }
}
