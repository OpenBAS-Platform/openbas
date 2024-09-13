package io.openbas.rest.attack_pattern;

import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.model.KillChainPhase;
import io.openbas.database.raw.RawAttackPattern;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.database.repository.KillChainPhaseRepository;
import io.openbas.database.specification.InjectorContractSpecification;
import io.openbas.rest.attack_pattern.form.AttackPatternCreateInput;
import io.openbas.rest.attack_pattern.form.AttackPatternUpdateInput;
import io.openbas.rest.attack_pattern.form.AttackPatternUpsertInput;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
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
import static io.openbas.database.specification.AttackPatternSpecification.byName;
import static io.openbas.helper.DatabaseHelper.updateRelation;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@RestController
@Secured(ROLE_USER)
public class AttackPatternApi extends RestBehavior {

    public static final String ATTACK_PATTERN_URI = "/api/attack_patterns";

    private AttackPatternRepository attackPatternRepository;

    private InjectorContractRepository injectorContractRepository;
    private KillChainPhaseRepository killChainPhaseRepository;

    @Autowired
    public void setAttackPatternRepository(AttackPatternRepository attackPatternRepository) {
        this.attackPatternRepository = attackPatternRepository;
    }

    @Autowired
    public void setKillChainPhaseRepository(KillChainPhaseRepository killChainPhaseRepository) {
        this.killChainPhaseRepository = killChainPhaseRepository;
    }

    @Autowired
    public void setInjectorContractRepository(InjectorContractRepository injectorContractRepository) {
        this.injectorContractRepository = injectorContractRepository;
    }

    @GetMapping("/api/attack_patterns")
    public List<RawAttackPattern> attackPatterns() {
        return attackPatternRepository.rawAll();
    }

    @PostMapping("/api/attack_patterns/search")
    public Page<AttackPattern> attackPatterns(@RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
        return buildPaginationJPA(
                (Specification<AttackPattern> specification, Pageable pageable) -> this.attackPatternRepository.findAll(
                        specification, pageable),
                searchPaginationInput,
                AttackPattern.class
        );
    }

    @GetMapping("/api/attack_patterns/{attackPatternId}")
    public AttackPattern attackPattern(@PathVariable String attackPatternId) {
        return attackPatternRepository.findById(attackPatternId).orElseThrow(ElementNotFoundException::new);
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/attack_patterns")
    @Transactional(rollbackOn = Exception.class)
    public AttackPattern createAttackPattern(@Valid @RequestBody AttackPatternCreateInput input) {
        AttackPattern attackPattern = new AttackPattern();
        attackPattern.setUpdateAttributes(input);
        attackPattern.setKillChainPhases(fromIterable(killChainPhaseRepository.findAllById(input.getKillChainPhasesIds())));
        attackPattern.setParent(updateRelation(input.getParentId(), attackPattern.getParent(), attackPatternRepository));
        return attackPatternRepository.save(attackPattern);
    }

    @GetMapping("/api/attack_patterns/{attackPatternId}/injector_contracts")
    public Iterable<InjectorContract> injectorContracts(@PathVariable String attackPatternId) {
        attackPatternRepository.findById(attackPatternId).orElseThrow(ElementNotFoundException::new);
        return injectorContractRepository.findAll(InjectorContractSpecification.fromAttackPattern(attackPatternId));
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/attack_patterns/{attackPatternId}")
    @Transactional(rollbackOn = Exception.class)
    public AttackPattern updateAttackPattern(
            @NotBlank @PathVariable final String attackPatternId,
            @Valid @RequestBody AttackPatternUpdateInput input) {
        AttackPattern attackPattern = this.attackPatternRepository.findById(attackPatternId).orElseThrow(ElementNotFoundException::new);
        attackPattern.setUpdateAttributes(input);
        attackPattern.setKillChainPhases(fromIterable(this.killChainPhaseRepository.findAllById(input.getKillChainPhasesIds())));
        attackPattern.setUpdatedAt(Instant.now());
        return attackPatternRepository.save(attackPattern);
    }

    private List<AttackPattern> upsertAttackPatterns(List<AttackPatternCreateInput> attackPatterns) {
        List<AttackPattern> upserted = new ArrayList<>();
        attackPatterns.forEach(attackPatternInput -> {
            String attackPatternExternalId = attackPatternInput.getExternalId();
            Optional<AttackPattern> optionalAttackPattern = attackPatternRepository.findByExternalId(
                    attackPatternExternalId);
            List<KillChainPhase> killChainPhases = !attackPatternInput.getKillChainPhasesIds().isEmpty() ?
                    fromIterable(killChainPhaseRepository.findAllById(attackPatternInput.getKillChainPhasesIds()))
                    : List.of();
            AttackPattern attackPatternParent = attackPatternInput.getParentId() != null ?
                    attackPatternRepository.findByStixId(attackPatternInput.getParentId()).orElseThrow(ElementNotFoundException::new) : null;
            if (optionalAttackPattern.isEmpty()) {
                AttackPattern newAttackPattern = new AttackPattern();
                newAttackPattern.setStixId(attackPatternInput.getStixId());
                newAttackPattern.setExternalId(attackPatternExternalId);
                newAttackPattern.setKillChainPhases(killChainPhases);
                newAttackPattern.setName(attackPatternInput.getName());
                newAttackPattern.setDescription(attackPatternInput.getDescription());
                newAttackPattern.setPlatforms(attackPatternInput.getPlatforms());
                newAttackPattern.setPermissionsRequired(attackPatternInput.getPermissionsRequired());
                newAttackPattern.setParent(attackPatternParent);
                upserted.add(newAttackPattern);
            } else {
                AttackPattern attackPattern = optionalAttackPattern.get();
                attackPattern.setStixId(attackPatternInput.getStixId());
                attackPattern.setKillChainPhases(killChainPhases);
                attackPattern.setName(attackPatternInput.getName());
                attackPattern.setDescription(attackPatternInput.getDescription());
                attackPattern.setPlatforms(attackPatternInput.getPlatforms());
                attackPattern.setPermissionsRequired(attackPatternInput.getPermissionsRequired());
                attackPattern.setParent(attackPatternParent);
                upserted.add(attackPattern);
            }
        });
        return fromIterable(this.attackPatternRepository.saveAll(upserted));
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/attack_patterns/upsert")
    @Transactional(rollbackOn = Exception.class)
    public Iterable<AttackPattern> upsertKillChainPhases(@Valid @RequestBody AttackPatternUpsertInput input) {
        List<AttackPattern> upserted = new ArrayList<>();
        List<AttackPatternCreateInput> attackPatterns = input.getAttackPatterns();
        List<AttackPatternCreateInput> patternsWithoutParent = attackPatterns.stream().filter(a -> a.getParentId() == null)
                .toList();
        List<AttackPatternCreateInput> patternsWithParent = attackPatterns.stream().filter(a -> a.getParentId() != null)
                .toList();
        upserted.addAll(upsertAttackPatterns(patternsWithoutParent));
        upserted.addAll(upsertAttackPatterns(patternsWithParent));
        return upserted;
    }

    @Secured(ROLE_ADMIN)
    @DeleteMapping("/api/attack_patterns/{attackPatternId}")
    @Transactional(rollbackOn = Exception.class)
    public void deleteAttackPattern(@PathVariable String attackPatternId) {
        attackPatternRepository.deleteById(attackPatternId);
    }

    // -- OPTION --

    @GetMapping(ATTACK_PATTERN_URI + "/options")
    public List<FilterUtilsJpa.Option> optionsByName(@RequestParam(required = false) final String searchText) {
        return fromIterable(this.attackPatternRepository.findAll(byName(searchText), Sort.by(Sort.Direction.ASC, "name")))
            .stream()
            .map(i -> new FilterUtilsJpa.Option(i.getId(), i.getName()))
            .toList();
    }

    @PostMapping(ATTACK_PATTERN_URI + "/options")
    public List<FilterUtilsJpa.Option> optionsById(@RequestBody final List<String> ids) {
        return fromIterable(this.attackPatternRepository.findAllById(ids))
            .stream()
            .map(i -> new FilterUtilsJpa.Option(i.getId(), i.getName()))
            .toList();
    }
}
