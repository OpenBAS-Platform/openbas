package io.openbas.rest.kill_chain_phase;

import io.openbas.database.model.KillChainPhase;
import io.openbas.database.repository.KillChainPhaseRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.kill_chain_phase.form.KillChainPhaseCreateInput;
import io.openbas.rest.kill_chain_phase.form.KillChainPhaseUpdateInput;
import io.openbas.rest.kill_chain_phase.form.KillChainPhaseUpsertInput;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.database.specification.KillChainPhaseSpecification.byName;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@RestController
@Secured(ROLE_USER)
public class KillChainPhaseApi extends RestBehavior {

  public static final String KILL_CHAIN_PHASE_URI = "/api/kill_chain_phases";

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
        (Specification<KillChainPhase> specification, Pageable pageable) -> this.killChainPhaseRepository.findAll(
            specification, pageable),
        searchPaginationInput,
        KillChainPhase.class
    );
  }

  @GetMapping("/api/kill_chain_phases/{killChainPhaseId}")
  public KillChainPhase killChainPhase(@PathVariable String killChainPhaseId) {
    return killChainPhaseRepository.findById(killChainPhaseId).orElseThrow(ElementNotFoundException::new);
  }

  @Secured(ROLE_ADMIN)
  @PutMapping("/api/kill_chain_phases/{killChainPhaseId}")
  @Transactional(rollbackOn = Exception.class)
  public KillChainPhase updateKillChainPhase(@PathVariable String killChainPhaseId,
      @Valid @RequestBody KillChainPhaseUpdateInput input) {
    KillChainPhase killchainPhase = killChainPhaseRepository.findById(killChainPhaseId).orElseThrow(ElementNotFoundException::new);
    killchainPhase.setUpdateAttributes(input);
    killchainPhase.setUpdatedAt(Instant.now());
    return killChainPhaseRepository.save(killchainPhase);
  }

  @Secured(ROLE_ADMIN)
  @PostMapping("/api/kill_chain_phases")
  @Transactional(rollbackOn = Exception.class)
  public KillChainPhase createKillChainPhase(@Valid @RequestBody KillChainPhaseCreateInput input) {
    KillChainPhase killChainPhase = new KillChainPhase();
    killChainPhase.setUpdateAttributes(input);
    return killChainPhaseRepository.save(killChainPhase);
  }

  @Secured(ROLE_ADMIN)
  @PostMapping("/api/kill_chain_phases/upsert")
  @Transactional(rollbackOn = Exception.class)
  public Iterable<KillChainPhase> upsertKillChainPhases(@Valid @RequestBody KillChainPhaseUpsertInput input) {
    List<KillChainPhase> upserted = new ArrayList<>();
    List<KillChainPhaseCreateInput> inputKillChainPhases = input.getKillChainPhases();
    inputKillChainPhases.forEach(killChainPhaseCreateInput -> {
      String killChainName = killChainPhaseCreateInput.getKillChainName();
      String shortName = killChainPhaseCreateInput.getShortName();
      Optional<KillChainPhase> optionalKillChainPhase = killChainPhaseRepository.findByKillChainNameAndShortName(
          killChainName, shortName);
      if (optionalKillChainPhase.isEmpty()) {
        KillChainPhase newKillChainPhase = new KillChainPhase();
        newKillChainPhase.setKillChainName(killChainName);
        newKillChainPhase.setStixId(killChainPhaseCreateInput.getStixId());
        newKillChainPhase.setExternalId(killChainPhaseCreateInput.getExternalId());
        newKillChainPhase.setShortName(shortName);
        newKillChainPhase.setName(killChainPhaseCreateInput.getName());
        newKillChainPhase.setDescription(killChainPhaseCreateInput.getDescription());
        newKillChainPhase.setOrder(
            Optional.ofNullable(KillChainPhaseUtils.orderFromMitreAttack().get(shortName)).orElse(0L));
        upserted.add(newKillChainPhase);
      } else {
        KillChainPhase killChainPhase = optionalKillChainPhase.get();
        killChainPhase.setStixId(killChainPhaseCreateInput.getStixId());
        killChainPhase.setShortName(killChainPhaseCreateInput.getShortName());
        killChainPhase.setName(killChainPhaseCreateInput.getName());
        killChainPhase.setExternalId(killChainPhaseCreateInput.getExternalId());
        killChainPhase.setDescription(killChainPhaseCreateInput.getDescription());
        upserted.add(killChainPhase);
      }
    });
    return this.killChainPhaseRepository.saveAll(upserted);
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping("/api/kill_chain_phases/{killChainPhaseId}")
  public void deleteKillChainPhase(@PathVariable String killChainPhaseId) {
    killChainPhaseRepository.deleteById(killChainPhaseId);
  }

  // -- OPTION --

  @GetMapping(KILL_CHAIN_PHASE_URI + "/options")
  public List<FilterUtilsJpa.Option> optionsByName(@RequestParam(required = false) final String searchText) {
    return fromIterable(this.killChainPhaseRepository.findAll(byName(searchText), Sort.by(Sort.Direction.ASC, "name")))
        .stream()
        .map(i -> new FilterUtilsJpa.Option(i.getId(), i.getName()))
        .toList();
  }

  @PostMapping(KILL_CHAIN_PHASE_URI + "/options")
  public List<FilterUtilsJpa.Option> optionsById(@RequestBody final List<String> ids) {
    return fromIterable(this.killChainPhaseRepository.findAllById(ids))
        .stream()
        .map(i -> new FilterUtilsJpa.Option(i.getId(), i.getName()))
        .toList();
  }

}
