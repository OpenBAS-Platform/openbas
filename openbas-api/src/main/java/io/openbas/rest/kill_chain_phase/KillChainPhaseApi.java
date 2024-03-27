package io.openbas.rest.kill_chain_phase;

import io.openbas.database.model.KillChainPhase;
import io.openbas.database.repository.KillChainPhaseRepository;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.kill_chain_phase.form.KillChainPhaseCreateInput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

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

  @PostMapping("/api/kill_chain_phases/search")
  public Page<KillChainPhase> killChainPhases(@RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        (Specification<KillChainPhase> specification, Pageable pageable) -> this.killChainPhaseRepository.findAll(specification, pageable),
        searchPaginationInput,
        KillChainPhase.class
    );
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
