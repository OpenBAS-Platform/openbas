package io.openbas.rest.kill_chain_phase;

import io.openbas.utils.pagination.PaginationField;
import io.openbas.database.model.KillChainPhase;
import io.openbas.database.repository.KillChainPhaseRepository;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.kill_chain_phase.form.KillChainPhaseCreateInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static io.openbas.utils.pagination.PaginationUtils.buildPagination;
import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.helper.StreamHelper.fromIterable;

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
  public Page<KillChainPhase> killChainPhases(
      @RequestBody PaginationField paginationField,
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "10") @Max(100) int size) {
    List<KillChainPhase> killChainPhases = fromIterable(killChainPhaseRepository.findAll());
    Pageable pageable = PageRequest.of(page, size, paginationField.getSort());
    return buildPagination(killChainPhases, pageable, paginationField);
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
