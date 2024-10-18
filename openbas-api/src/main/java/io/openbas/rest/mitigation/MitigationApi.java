package io.openbas.rest.mitigation;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.Mitigation;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.MitigationRepository;
import io.openbas.database.specification.AttackPatternSpecification;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.mitigation.form.MitigationCreateInput;
import io.openbas.rest.mitigation.form.MitigationUpdateInput;
import io.openbas.rest.mitigation.form.MitigationUpsertInput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

@RestController
@Secured(ROLE_USER)
public class MitigationApi extends RestBehavior {

  private MitigationRepository mitigationRepository;

  private AttackPatternRepository attackPatternRepository;

  @Autowired
  public void setMitigationRepository(MitigationRepository mitigationRepository) {
    this.mitigationRepository = mitigationRepository;
  }

  @Autowired
  public void setAttackPatternRepository(AttackPatternRepository attackPatternRepository) {
    this.attackPatternRepository = attackPatternRepository;
  }

  @GetMapping("/api/mitigations")
  public Iterable<Mitigation> mitigations() {
    return mitigationRepository.findAll();
  }

  @PostMapping("/api/mitigations/search")
  public Page<Mitigation> mitigations(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        (Specification<Mitigation> specification, Pageable pageable) ->
            this.mitigationRepository.findAll(specification, pageable),
        searchPaginationInput,
        Mitigation.class);
  }

  @GetMapping("/api/mitigations/{mitigationId}")
  public Mitigation mitigation(@PathVariable String mitigationId) {
    return mitigationRepository.findById(mitigationId).orElseThrow(ElementNotFoundException::new);
  }

  @Secured(ROLE_ADMIN)
  @PostMapping("/api/mitigations")
  @Transactional(rollbackOn = Exception.class)
  public Mitigation createMitigation(@Valid @RequestBody MitigationCreateInput input) {
    Mitigation mitigation = new Mitigation();
    mitigation.setUpdateAttributes(input);
    mitigation.setAttackPatterns(
        fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
    return mitigationRepository.save(mitigation);
  }

  @GetMapping("/api/mitigations/{mitigationId}/attack_patterns")
  public Iterable<AttackPattern> injectorContracts(@PathVariable String mitigationId) {
    mitigationRepository.findById(mitigationId).orElseThrow(ElementNotFoundException::new);
    return attackPatternRepository.findAll(
        AttackPatternSpecification.fromAttackPattern(mitigationId));
  }

  @Secured(ROLE_ADMIN)
  @PutMapping("/api/mitigations/{mitigationId}")
  public Mitigation updateMitigation(
      @NotBlank @PathVariable final String mitigationId,
      @Valid @RequestBody MitigationUpdateInput input) {
    Mitigation mitigation =
        this.mitigationRepository.findById(mitigationId).orElseThrow(ElementNotFoundException::new);
    mitigation.setUpdateAttributes(input);
    mitigation.setAttackPatterns(
        fromIterable(this.attackPatternRepository.findAllById(input.getAttackPatternsIds())));
    mitigation.setUpdatedAt(Instant.now());
    return mitigationRepository.save(mitigation);
  }

  private List<Mitigation> upsertMitigations(List<MitigationCreateInput> mitigations) {
    List<Mitigation> upserted = new ArrayList<>();
    mitigations.forEach(
        mitigationInput -> {
          String mitigationExternalId = mitigationInput.getExternalId();
          Optional<Mitigation> optionalMitigation =
              mitigationRepository.findByExternalId(mitigationExternalId);
          List<AttackPattern> attackPatterns =
              !mitigationInput.getAttackPatternsIds().isEmpty()
                  ? fromIterable(
                      attackPatternRepository.findAllById(mitigationInput.getAttackPatternsIds()))
                  : List.of();
          if (optionalMitigation.isEmpty()) {
            Mitigation newMitigation = new Mitigation();
            newMitigation.setStixId(mitigationInput.getStixId());
            newMitigation.setExternalId(mitigationExternalId);
            newMitigation.setAttackPatterns(attackPatterns);
            newMitigation.setName(mitigationInput.getName());
            newMitigation.setDescription(mitigationInput.getDescription());
            newMitigation.setLogSources(mitigationInput.getLogSources());
            newMitigation.setThreatHuntingTechniques(mitigationInput.getThreatHuntingTechniques());
            upserted.add(newMitigation);
          } else {
            Mitigation mitigation = optionalMitigation.get();
            mitigation.setStixId(mitigationInput.getStixId());
            mitigation.setAttackPatterns(attackPatterns);
            mitigation.setName(mitigationInput.getName());
            mitigation.setDescription(mitigationInput.getDescription());
            mitigation.setLogSources(mitigationInput.getLogSources());
            mitigation.setThreatHuntingTechniques(mitigationInput.getThreatHuntingTechniques());
            upserted.add(mitigation);
          }
        });
    return fromIterable(this.mitigationRepository.saveAll(upserted));
  }

  @Secured(ROLE_ADMIN)
  @PostMapping("/api/mitigations/upsert")
  @Transactional(rollbackOn = Exception.class)
  public Iterable<Mitigation> upsertKillChainPhases(
      @Valid @RequestBody MitigationUpsertInput input) {
    List<MitigationCreateInput> mitigations = input.getMitigations();
    return new ArrayList<>(upsertMitigations(mitigations));
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping("/api/mitigations/{mitigationId}")
  public void deleteMitigation(@PathVariable String mitigationId) {
    mitigationRepository.deleteById(mitigationId);
  }
}
