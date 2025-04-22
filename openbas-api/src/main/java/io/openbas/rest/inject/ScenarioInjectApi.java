package io.openbas.rest.inject;

import static io.openbas.database.specification.InjectSpecification.fromScenario;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationCriteriaBuilder;
import static java.time.Instant.now;

import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.form.InjectDocumentInput;
import io.openbas.rest.inject.form.InjectInput;
import io.openbas.rest.inject.form.InjectUpdateActivationInput;
import io.openbas.rest.inject.output.InjectOutput;
import io.openbas.rest.inject.output.InjectTestStatusOutput;
import io.openbas.rest.inject.service.InjectDuplicateService;
import io.openbas.rest.inject.service.InjectService;
import io.openbas.service.*;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.persistence.criteria.Join;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ScenarioInjectApi extends RestBehavior {

  private final InjectSearchService injectSearchService;
  private final InjectTestStatusService injectTestStatusService;
  private final InjectRepository injectRepository;
  private final InjectDocumentRepository injectDocumentRepository;
  private final ScenarioService scenarioService;
  private final InjectService injectService;
  private final InjectDuplicateService injectDuplicateService;
  private final TeamRepository teamRepository;
  private final TagRepository tagRepository;
  private final DocumentRepository documentRepository;
  private final AssetService assetService;
  private final AssetGroupService assetGroupService;

  // -- SCENARIOS --

  @PostMapping(SCENARIO_URI + "/{scenarioId}/injects")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  @Transactional(rollbackFor = Exception.class)
  public Inject createInjectForScenario(
      @PathVariable @NotBlank final String scenarioId, @Valid @RequestBody InjectInput input) {
    Scenario scenario = this.scenarioService.scenario(scenarioId);
    return this.injectService.createInject(null, scenario, input);
  }

  @PostMapping(SCENARIO_URI + "/{scenarioId}/injects/{injectId}")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public Inject duplicateInjectForScenario(
      @PathVariable @NotBlank final String scenarioId,
      @PathVariable @NotBlank final String injectId) {
    return injectDuplicateService.duplicateInjectForScenarioWithDuplicateWordInTitle(
        scenarioId, injectId);
  }

  @GetMapping(SCENARIO_URI + "/{scenarioId}/injects")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  public Iterable<Inject> scenarioInjects(@PathVariable @NotBlank final String scenarioId) {
    return this.injectRepository.findByScenarioId(scenarioId).stream()
        .sorted(Inject.executionComparator)
        .toList();
  }

  @GetMapping(SCENARIO_URI + "/{scenarioId}/injects/{injectId}")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  public Inject scenarioInject(
      @PathVariable @NotBlank final String scenarioId,
      @PathVariable @NotBlank final String injectId) {
    Scenario scenario = this.scenarioService.scenario(scenarioId);
    assert scenarioId.equals(scenario.getId());
    return injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
  }

  @Transactional(rollbackFor = Exception.class)
  @PutMapping(SCENARIO_URI + "/{scenarioId}/injects/{injectId}")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public Inject updateInjectForScenario(
      @PathVariable @NotBlank final String scenarioId,
      @PathVariable @NotBlank final String injectId,
      @Valid @RequestBody @NotNull InjectInput input) {
    Scenario scenario = this.scenarioService.scenario(scenarioId);
    Inject inject = updateInject(injectId, input);

    // It should not be possible to add EE executor on inject when the scenario is already
    // scheduled.
    if (scenario.getRecurrenceStart() != null) {
      this.injectService.throwIfInjectNotLaunchable(inject);
    }

    // If Documents not yet linked directly to the exercise, attached it
    inject
        .getDocuments()
        .forEach(
            document -> {
              if (!document.getDocument().getScenarios().contains(scenario)) {
                scenario.getDocuments().add(document.getDocument());
              }
            });
    this.scenarioService.updateScenario(scenario);
    return injectRepository.save(inject);
  }

  @PutMapping(SCENARIO_URI + "/{scenarioId}/injects/{injectId}/activation")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public Inject updateInjectActivationForScenario(
      @PathVariable @NotBlank final String scenarioId,
      @PathVariable @NotBlank final String injectId,
      @Valid @RequestBody InjectUpdateActivationInput input) {
    return updateInjectActivation(injectId, input);
  }

  @Transactional(rollbackFor = Exception.class)
  @DeleteMapping(SCENARIO_URI + "/{scenarioId}/injects/{injectId}")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public void deleteInjectForScenario(
      @PathVariable @NotBlank final String scenarioId,
      @PathVariable @NotBlank final String injectId) {
    Scenario scenario = this.scenarioService.scenario(scenarioId);
    assert scenarioId.equals(scenario.getId());
    this.injectDocumentRepository.deleteDocumentsFromInject(injectId);
    this.injectRepository.deleteById(injectId);
  }

  @GetMapping(SCENARIO_URI + "/{scenarioId}/injects/simple")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  @Transactional(readOnly = true)
  public Iterable<InjectOutput> scenarioInjectsSimple(
      @PathVariable @NotBlank final String scenarioId) {
    return injectSearchService.injects(fromScenario(scenarioId));
  }

  @PostMapping(SCENARIO_URI + "/{scenarioId}/injects/simple")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  @Transactional(readOnly = true)
  public Iterable<InjectOutput> scenarioInjectsSimple(
      @PathVariable @NotBlank final String scenarioId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    Map<String, Join<Base, Base>> joinMap = new HashMap<>();
    return buildPaginationCriteriaBuilder(
        (Specification<Inject> specification,
            Specification<Inject> specificationCount,
            Pageable pageable) ->
            this.injectSearchService.injects(
                fromScenario(scenarioId).and(specification),
                fromScenario(scenarioId).and(specificationCount),
                pageable,
                joinMap),
        searchPaginationInput,
        Inject.class,
        joinMap);
  }

  @PostMapping("/api/scenario/{scenarioId}/injects/test")
  public Page<InjectTestStatusOutput> findAllScenarioInjectTests(
      @PathVariable @NotBlank String scenarioId,
      @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    return injectTestStatusService.findAllInjectTestsByScenarioId(
        scenarioId, searchPaginationInput);
  }

  // -- SCENARIOS --

  private Inject updateInject(@NotBlank final String injectId, @NotNull InjectInput input) {
    Inject inject =
        this.injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
    inject.setUpdateAttributes(input);

    // Set dependencies
    if (input.getDependsOn() != null) {
      input
          .getDependsOn()
          .forEach(
              entry -> {
                Optional<InjectDependency> existingDependency =
                    inject.getDependsOn().stream()
                        .filter(
                            injectDependency ->
                                injectDependency
                                    .getCompositeId()
                                    .getInjectParent()
                                    .getId()
                                    .equals(entry.getRelationship().getInjectParentId()))
                        .findFirst();
                if (existingDependency.isPresent()) {
                  existingDependency
                      .get()
                      .getInjectDependencyCondition()
                      .setConditions(entry.getConditions().getConditions());
                  existingDependency
                      .get()
                      .getInjectDependencyCondition()
                      .setMode(entry.getConditions().getMode());
                } else {
                  InjectDependency injectDependency = new InjectDependency();
                  injectDependency.getCompositeId().setInjectChildren(inject);
                  injectDependency
                      .getCompositeId()
                      .setInjectParent(
                          injectRepository
                              .findById(entry.getRelationship().getInjectParentId())
                              .orElse(null));
                  injectDependency.setInjectDependencyCondition(
                      new InjectDependencyConditions.InjectDependencyCondition());
                  injectDependency
                      .getInjectDependencyCondition()
                      .setConditions(entry.getConditions().getConditions());
                  injectDependency
                      .getInjectDependencyCondition()
                      .setMode(entry.getConditions().getMode());
                  inject.getDependsOn().add(injectDependency);
                }
              });
    }

    List<InjectDependency> injectDepencyToRemove = new ArrayList<>();
    if (inject.getDependsOn() != null && !inject.getDependsOn().isEmpty()) {
      if (input.getDependsOn() != null && !input.getDependsOn().isEmpty()) {
        inject
            .getDependsOn()
            .forEach(
                injectDependency -> {
                  if (!input.getDependsOn().stream()
                      .map(
                          (injectDependencyInput ->
                              injectDependencyInput.getRelationship().getInjectParentId()))
                      .toList()
                      .contains(injectDependency.getCompositeId().getInjectParent().getId())) {
                    injectDepencyToRemove.add(injectDependency);
                  }
                });
      } else {
        injectDepencyToRemove.addAll(inject.getDependsOn());
      }
      inject.getDependsOn().removeAll(injectDepencyToRemove);
    }

    inject.setTeams(fromIterable(this.teamRepository.findAllById(input.getTeams())));
    inject.setAssets(fromIterable(this.assetService.assets(input.getAssets())));
    inject.setAssetGroups(fromIterable(this.assetGroupService.assetGroups(input.getAssetGroups())));
    inject.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));

    // Set documents
    List<InjectDocumentInput> inputDocuments = input.getDocuments();
    List<InjectDocument> injectDocuments = inject.getDocuments();

    List<String> askedDocumentIds =
        inputDocuments.stream().map(InjectDocumentInput::getDocumentId).toList();
    List<String> currentDocumentIds =
        inject.getDocuments().stream().map(document -> document.getDocument().getId()).toList();
    // To delete
    List<InjectDocument> toRemoveDocuments =
        injectDocuments.stream()
            .filter(injectDoc -> !askedDocumentIds.contains(injectDoc.getDocument().getId()))
            .toList();
    injectDocuments.removeAll(toRemoveDocuments);
    // To add
    inputDocuments.stream()
        .filter(doc -> !currentDocumentIds.contains(doc.getDocumentId()))
        .forEach(
            in -> {
              Optional<Document> doc = this.documentRepository.findById(in.getDocumentId());
              if (doc.isPresent()) {
                InjectDocument injectDocument = new InjectDocument();
                injectDocument.setInject(inject);
                Document document = doc.get();
                injectDocument.setDocument(document);
                injectDocument.setAttached(in.isAttached());
                InjectDocument savedInjectDoc = this.injectDocumentRepository.save(injectDocument);
                injectDocuments.add(savedInjectDoc);
              }
            });
    // Remap the attached boolean
    injectDocuments.forEach(
        injectDoc -> {
          Optional<InjectDocumentInput> inputInjectDoc =
              input.getDocuments().stream()
                  .filter(id -> id.getDocumentId().equals(injectDoc.getDocument().getId()))
                  .findFirst();
          Boolean attached = inputInjectDoc.map(InjectDocumentInput::isAttached).orElse(false);
          injectDoc.setAttached(attached);
        });
    inject.setDocuments(injectDocuments);

    return inject;
  }

  private Inject updateInjectActivation(
      @NotBlank final String injectId, @NotNull final InjectUpdateActivationInput input) {
    Inject inject =
        this.injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
    inject.setEnabled(input.isEnabled());
    inject.setUpdatedAt(now());
    return injectRepository.save(inject);
  }
}
