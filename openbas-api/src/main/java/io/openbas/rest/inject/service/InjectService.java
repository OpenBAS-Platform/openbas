package io.openbas.rest.inject.service;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.AgentUtils.isPrimaryAgent;
import static io.openbas.utils.FilterUtilsJpa.computeFilterGroupJpa;
import static io.openbas.utils.StringUtils.duplicateString;
import static io.openbas.utils.pagination.SearchUtilsJpa.computeSearchJpa;
import static java.time.Instant.now;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.config.cache.LicenseCacheManager;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.database.specification.InjectSpecification;
import io.openbas.ee.Ee;
import io.openbas.injector_contract.fields.ContractFieldType;
import io.openbas.rest.atomic_testing.form.ExecutionTraceOutput;
import io.openbas.rest.atomic_testing.form.InjectResultOverviewOutput;
import io.openbas.rest.atomic_testing.form.InjectExecutionOutput;
import io.openbas.rest.document.DocumentService;
import io.openbas.rest.exception.BadRequestException;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.exception.LicenseRestrictionException;
import io.openbas.rest.inject.form.*;
import io.openbas.rest.inject.output.AgentsAndAssetsAgentless;
import io.openbas.rest.injector_contract.InjectorContractService;
import io.openbas.rest.security.SecurityExpression;
import io.openbas.rest.security.SecurityExpressionHandler;
import io.openbas.rest.tag.TagService;
import io.openbas.service.AssetGroupService;
import io.openbas.service.AssetService;
import io.openbas.service.TagRuleService;
import io.openbas.service.UserService;
import io.openbas.utils.*;
import jakarta.annotation.Nullable;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.*;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.Hibernate;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

@RequiredArgsConstructor
@Service
@Log
public class InjectService {

  private final TeamRepository teamRepository;
  private final ExecutionTraceRepository executionTraceRepository;
  private final AssetService assetService;
  private final AssetGroupService assetGroupService;
  private final Ee eeService;
  private final InjectRepository injectRepository;
  private final InjectDocumentRepository injectDocumentRepository;
  private final InjectExecutionRepository injectExecutionRepository;
  private final InjectMapper injectMapper;
  private final MethodSecurityExpressionHandler methodSecurityExpressionHandler;
  private final UserService userService;
  private final InjectorContractService injectorContractService;
  private final TagRuleService tagRuleService;
  private final TagService tagService;
  private final DocumentService documentService;
  private final InjectExecutionMapper injectExecutionMapper;
  private final TagRepository tagRepository;
  private final DocumentRepository documentRepository;

  private final LicenseCacheManager licenseCacheManager;
  @Resource protected ObjectMapper mapper;

  private SecurityExpression getAmbientSecurityExpression() {
    return ((SecurityExpressionHandler) methodSecurityExpressionHandler).getSecurityExpression();
  }

  public Inject createInject(
      @Nullable final Exercise exercise,
      @Nullable final Scenario scenario,
      @NotNull final InjectInput input) {
    if (exercise == null && scenario == null || exercise != null && scenario != null) {
      throw new IllegalArgumentException("Exactly one of exercise or scenario should be present");
    }

    InjectorContract injectorContract =
        this.injectorContractService.injectorContract(input.getInjectorContract());
    // Get common attributes
    Inject inject = input.toInject(injectorContract);
    inject.setUser(this.userService.currentUser());
    inject.setTeams(fromIterable(teamRepository.findAllById(input.getTeams())));
    inject.setAssets(fromIterable(assetService.assets(input.getAssets())));
    inject.setTags(iterableToSet(tagService.tags(input.getTagIds())));
    List<InjectDocument> injectDocuments =
        input.getDocuments().stream()
            .map(i -> i.toDocument(documentService.document(i.getDocumentId()), inject))
            .toList();
    inject.setDocuments(injectDocuments);
    // Set dependencies
    if (input.getDependsOn() != null) {
      inject
          .getDependsOn()
          .addAll(
              input.getDependsOn().stream()
                  .map(
                      injectDependencyInput ->
                          injectDependencyInput.toInjectDependency(
                              inject,
                              this.inject(
                                  injectDependencyInput.getRelationship().getInjectParentId())))
                  .toList());
    }

    Set<Tag> tags = new HashSet<>();
    // EXERCISE
    if (exercise != null) {
      tags = exercise.getTags();
      inject.setExercise(exercise);
      // Linked documents directly to the exercise
      inject
          .getDocuments()
          .forEach(
              document -> {
                if (!document.getDocument().getExercises().contains(exercise)) {
                  exercise.getDocuments().add(document.getDocument());
                }
              });
    }
    // SCENARIO
    if (scenario != null) {
      tags = scenario.getTags();
      inject.setScenario(scenario);
      // Linked documents directly to the scenario
      inject
          .getDocuments()
          .forEach(
              document -> {
                if (!document.getDocument().getScenarios().contains(scenario)) {
                  scenario.getDocuments().add(document.getDocument());
                }
              });
    }

    // verify if inject is not manual/sms/emails...
    if (this.canApplyAssetGroupToInject(inject)) {
      // add default asset groups
      inject.setAssetGroups(
          this.tagRuleService.applyTagRuleToInjectCreation(
              tags.stream().map(Tag::getId).toList(),
              assetGroupService.assetGroups(input.getAssetGroups())));
    }

    // if inject content is null we add the defaults from the injector contract
    // this is the case when creating an inject from OpenCti
    if (inject.getContent() == null || inject.getContent().isEmpty()) {
      inject.setContent(
          injectorContractService.getDynamicInjectorContractFieldsForInject(injectorContract));
    }

    return injectRepository.save(inject);
  }

  public Inject inject(@NotBlank final String injectId) {
    return this.injectRepository
        .findById(injectId)
        .orElseThrow(() -> new ElementNotFoundException("Inject not found with id: " + injectId));
  }

  @Transactional(rollbackOn = Exception.class)
  public void deleteAllByIds(List<String> injectIds) {
    if (!CollectionUtils.isEmpty(injectIds)) {
      injectRepository.deleteAllById(injectIds);
    }
  }

  /**
   * Delete all injects given as params
   *
   * @param injects the injects to delete
   */
  @Transactional(rollbackOn = Exception.class)
  public void deleteAll(List<Inject> injects) {
    if (!CollectionUtils.isEmpty(injects)) {
      injectRepository.deleteAll(injects);
    }
  }

  public List<AssetToExecute> resolveAllAssetsToExecute(@NotNull final Inject inject) {
    List<AssetToExecute> assetToExecutes = new ArrayList<>();

    inject.getAssets().forEach(asset -> assetToExecutes.add(new AssetToExecute(asset)));

    inject
        .getAssetGroups()
        .forEach(
            assetGroup -> {
              List<Asset> assetsFromGroup =
                  this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());

              assetsFromGroup.forEach(
                  asset -> {
                    AssetToExecute existingAssetToExecute =
                        assetToExecutes.stream()
                            .filter(as -> as.asset().getId().equals(asset.getId()))
                            .findFirst()
                            .orElse(null);

                    if (existingAssetToExecute != null) {
                      existingAssetToExecute.assetGroups().add(assetGroup);
                    } else {
                      AssetToExecute newAssetToExecute =
                          new AssetToExecute(asset, false, new ArrayList<>());
                      newAssetToExecute.assetGroups().add(assetGroup);
                      assetToExecutes.add(newAssetToExecute);
                    }
                  });
            });

    return assetToExecutes;
  }

  public void cleanInjectsDocExercise(String exerciseId, String documentId) {
    // Delete document from all exercise injects
    List<Inject> exerciseInjects =
        injectRepository.findAllForExerciseAndDoc(exerciseId, documentId);
    List<InjectDocument> updatedInjects =
        exerciseInjects.stream()
            .flatMap(
                inject -> {
                  @SuppressWarnings("UnnecessaryLocalVariable")
                  Stream<InjectDocument> filterDocuments =
                      inject.getDocuments().stream()
                          .filter(document -> document.getDocument().getId().equals(documentId));
                  return filterDocuments;
                })
            .toList();
    injectDocumentRepository.deleteAll(updatedInjects);
  }

  public <T> T convertInjectContent(@NotNull final Inject inject, @NotNull final Class<T> converter)
      throws Exception {
    ObjectNode content = inject.getContent();
    return this.mapper.treeToValue(content, converter);
  }

  public void cleanInjectsDocScenario(String scenarioId, String documentId) {
    // Delete document from all scenario injects
    List<Inject> scenarioInjects =
        injectRepository.findAllForScenarioAndDoc(scenarioId, documentId);
    List<InjectDocument> updatedInjects =
        scenarioInjects.stream()
            .flatMap(
                inject -> {
                  @SuppressWarnings("UnnecessaryLocalVariable")
                  Stream<InjectDocument> filterDocuments =
                      inject.getDocuments().stream()
                          .filter(document -> document.getDocument().getId().equals(documentId));
                  return filterDocuments;
                })
            .toList();
    injectDocumentRepository.deleteAll(updatedInjects);
  }

  @Transactional
  public InjectResultOverviewOutput duplicate(String id) {
    Inject duplicatedInject = findAndDuplicateInject(id);
    duplicatedInject.setTitle(duplicateString(duplicatedInject.getTitle()));
    Inject savedInject = injectRepository.save(duplicatedInject);
    return injectMapper.toInjectResultOverviewOutput(savedInject);
  }

  public void throwIfInjectNotLaunchable(Inject inject) {
    if (eeService.isLicenseActive(licenseCacheManager.getEnterpriseEditionInfo())) {
      return;
    }
    List<Agent> agents = this.getAgentsByInject(inject);
    List<String> eeExecutors = eeService.detectEEExecutors(agents);

    if (!eeExecutors.isEmpty()) {
      throw new LicenseRestrictionException(
          "Some asset will be executed through " + String.join(" and ", eeExecutors));
    }
  }

  @Transactional
  public InjectResultOverviewOutput launch(String id) {
    Inject inject = injectRepository.findById(id).orElseThrow(ElementNotFoundException::new);
    this.throwIfInjectNotLaunchable(inject);
    inject.clean();
    inject.setUpdatedAt(Instant.now());
    Inject savedInject = saveInjectAndExecutionAsQueuing(inject);
    return injectMapper.toInjectResultOverviewOutput(savedInject);
  }

  @Transactional
  public InjectResultOverviewOutput relaunch(String id) {
    Inject duplicatedInject = findAndDuplicateInject(id);
    this.throwIfInjectNotLaunchable(duplicatedInject);
    Inject savedInject = saveInjectAndExecutionAsQueuing(duplicatedInject);
    delete(id);
    return injectMapper.toInjectResultOverviewOutput(savedInject);
  }

  @Transactional
  public void delete(String id) {
    injectDocumentRepository.deleteDocumentsFromInject(id);
    injectRepository.deleteById(id);
  }

  /**
   * Update an inject with default asset groups
   *
   * @param injectId
   * @param defaultAssetGroupsToAdd
   * @return
   */
  @Transactional
  public Inject applyDefaultAssetGroupsToInject(
      final String injectId, final List<AssetGroup> defaultAssetGroupsToAdd) {

    // fetch the inject
    Inject inject =
        this.injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);

    // remove/add default asset groups and remove duplicates
    List<AssetGroup> currentAssetGroups = inject.getAssetGroups();

    Set<String> uniqueAssetGroupIds = new HashSet<>();
    List<AssetGroup> newListOfAssetGroups =
        Stream.concat(currentAssetGroups.stream(), defaultAssetGroupsToAdd.stream())
            .filter(assetGroup -> uniqueAssetGroupIds.add(assetGroup.getId()))
            .collect(Collectors.toList());

    if (new HashSet<>(currentAssetGroups).equals(new HashSet<>(newListOfAssetGroups))) {
      return inject;
    } else {
      inject.setAssetGroups(newListOfAssetGroups);
      return this.injectRepository.save(inject);
    }
  }

  /**
   * Check if asset can be applied to a specific inject (will return false for Manual/Email...
   * injects)
   *
   * @param inject
   * @return
   */
  public boolean canApplyAssetGroupToInject(final Inject inject) {

    JsonNode jsonNode = null;
    try {
      jsonNode = mapper.readTree(inject.getInjectorContract().orElseThrow().getContent());
    } catch (JsonProcessingException e) {
      throw new RuntimeException("Unable to injector contract", e);
    }
    return !StreamSupport.stream(jsonNode.get("fields").spliterator(), false)
        .filter(
            contractElement ->
                contractElement.get("type").asText().equals(ContractFieldType.AssetGroup.label))
        .toList()
        .isEmpty();
  }

  private Inject findAndDuplicateInject(String id) {
    Inject injectOrigin = injectRepository.findById(id).orElseThrow(ElementNotFoundException::new);
    return InjectUtils.duplicateInject(injectOrigin);
  }

  private Inject saveInjectAndExecutionAsQueuing(Inject inject) {
    Inject savedInject = injectRepository.save(inject);
    InjectExecution injectExecution = saveInjectExecutionAsQueuing(savedInject);
    savedInject.setExecutions(new ArrayList<>(Arrays.asList(injectExecution)));
    return savedInject;
  }

  private InjectExecution saveInjectExecutionAsQueuing(Inject inject) {
    InjectExecution injectExecution = new InjectExecution();
    injectExecution.setInject(inject);
    injectExecution.setTrackingSentDate(Instant.now());
    injectExecution.setName(ExecutionStatus.QUEUING);
    this.injectExecutionRepository.save(injectExecution);
    return injectExecution;
  }

  /**
   * Get the inject specification for the search pagination input
   *
   * @param input the search input
   * @return the inject specification to search in DB
   * @throws BadRequestException if neither of the searchPaginationInput or injectIDsToSearch is
   *     provided
   */
  public Specification<Inject> getInjectSpecification(final InjectBulkProcessingInput input) {
    if ((CollectionUtils.isEmpty(input.getInjectIDsToProcess())
            && (input.getSearchPaginationInput() == null))
        || (!CollectionUtils.isEmpty(input.getInjectIDsToProcess())
            && (input.getSearchPaginationInput() != null))) {
      throw new BadRequestException(
          "Either inject_ids_to_process or search_pagination_input must be provided, and not both at the same time");
    }
    Specification<Inject> filterSpecifications =
        InjectSpecification.fromScenarioOrSimulation(input.getSimulationOrScenarioId());
    if (input.getSearchPaginationInput() == null) {
      filterSpecifications =
          filterSpecifications.and(
              JpaUtils.computeIn(Inject.ID_FIELD_NAME, input.getInjectIDsToProcess()));
    } else {
      filterSpecifications =
          filterSpecifications.and(
              computeFilterGroupJpa(input.getSearchPaginationInput().getFilterGroup()));
      filterSpecifications =
          filterSpecifications.and(
              computeSearchJpa(input.getSearchPaginationInput().getTextSearch()));
    }
    if (!CollectionUtils.isEmpty(input.getInjectIDsToIgnore())) {
      filterSpecifications =
          filterSpecifications.and(
              JpaUtils.computeNotIn(Inject.ID_FIELD_NAME, input.getInjectIDsToIgnore()));
    }
    return filterSpecifications;
  }

  /**
   * Update injects in bulk corresponding to the given criteria with a list of operations
   *
   * @param injectsToUpdate list of injects to update
   * @param operations the operations to perform with fields and values to add, remove or replace
   * @return the list of updated injects
   */
  public List<Inject> bulkUpdateInject(
      final List<Inject> injectsToUpdate, final List<InjectBulkUpdateOperation> operations) {
    // We aggregate the different field values in distinct sets in order to avoid retrieving the
    // same data multiple times
    Set<String> teamsIDs = new HashSet<>();
    Set<String> assetsIDs = new HashSet<>();
    Set<String> assetGroupsIDs = new HashSet<>();
    for (var operation : operations) {
      if (CollectionUtils.isEmpty(operation.getValues())) {
        continue;
      }

      switch (operation.getField()) {
        case TEAMS -> teamsIDs.addAll(operation.getValues());
        case ASSETS -> assetsIDs.addAll(operation.getValues());
        case ASSET_GROUPS -> assetGroupsIDs.addAll(operation.getValues());
        default ->
            throw new BadRequestException("Invalid field to update: " + operation.getOperation());
      }
    }

    // We retrieve the data from DB for teams, assets and asset groups in the input values
    Map<String, Team> teamsFromDB =
        this.teamRepository.findAllById(teamsIDs).stream()
            .collect(Collectors.toMap(Team::getId, team -> team));
    Map<String, Asset> assetsFromDB =
        this.assetService.assets(assetsIDs.stream().toList()).stream()
            .collect(Collectors.toMap(Asset::getId, asset -> asset));
    Map<String, AssetGroup> assetGroupsFromDB =
        this.assetGroupService.assetGroups(assetGroupsIDs.stream().toList()).stream()
            .collect(Collectors.toMap(AssetGroup::getId, assetGroup -> assetGroup));

    // we update the injects values
    injectsToUpdate.forEach(
        inject ->
            applyUpdateOperation(inject, operations, teamsFromDB, assetsFromDB, assetGroupsFromDB));

    // Save updated injects and return them
    return this.injectRepository.saveAll(injectsToUpdate);
  }

  /**
   * Get the injects to update/delete and check if the user is allowed to update/delete them
   *
   * @param input the injects search input.
   * @return the injects to update/delete
   * @throws AccessDeniedException if the user is not allowed to update/delete the injects
   */
  public List<Inject> getInjectsAndCheckPermission(
      InjectBulkProcessingInput input, Grant.GRANT_TYPE requested_grant_level) {
    // Control and format inputs
    // Specification building
    Specification<Inject> filterSpecifications = getInjectSpecification(input);

    // Services calls
    // Bulk select
    List<Inject> injectsToProcess = this.injectRepository.findAll(filterSpecifications);

    // Assert that the user is allowed to delete the injects
    // Can't use PreAuthorized as we don't have the data about involved scenarios and simulations

    switch (requested_grant_level) {
      case OBSERVER -> authoriseWithThrow(injectsToProcess, SecurityExpression::isInjectObserver);
      case PLANNER -> authoriseWithThrow(injectsToProcess, SecurityExpression::isInjectPlanner);
      default ->
          throw new AccessDeniedException(
              "No specified behaviour for grant %s".formatted(requested_grant_level.toString()));
    }
    return injectsToProcess;
  }

  /**
   * Check if the user is allowed to delete the injects from the scenario or exercise
   *
   * @param injects the injects to check
   * @param authoriseFunction the function to check if the user is a planner for the scenario or
   *     exercise
   * @throws AccessDeniedException if the user is not allowed to delete the injects from the
   *     scenario or exercise
   */
  public <T extends Base> void authoriseWithThrow(
      List<Inject> injects, BiFunction<SecurityExpression, String, Boolean> authoriseFunction) {
    InjectAuthorisationResult result = this.authorise(injects, authoriseFunction);
    if (!result.getUnauthorised().isEmpty()) {
      throw new AccessDeniedException(
          "You are not allowed to alter the injects of ids "
              + String.join(", ", result.getUnauthorised().stream().map(Inject::getId).toList()));
    }
  }

  /**
   * Check if the user is allowed to operate on the injects based on security challenge
   *
   * @param injects the injects to check
   * @param authoriseFunction the function to check if the user has the relevant privilege on
   *     injects
   * @return List of all authorised Injects
   */
  public InjectAuthorisationResult authorise(
      List<Inject> injects, BiFunction<SecurityExpression, String, Boolean> authoriseFunction) {
    InjectAuthorisationResult result = new InjectAuthorisationResult();
    for (Inject inject : injects) {
      if (authoriseFunction.apply(getAmbientSecurityExpression(), inject.getId())) {
        result.addAuthorised(inject);
      } else {
        result.addUnauthorised(inject);
      }
    }
    return result;
  }

  public Inject updateInject(
      @NotBlank final String injectId, @jakarta.validation.constraints.NotNull InjectInput input) {
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

  public Inject updateInjectActivation(
      @NotBlank final String injectId,
      @jakarta.validation.constraints.NotNull final InjectUpdateActivationInput input) {
    Inject inject =
        this.injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
    inject.setEnabled(input.isEnabled());
    inject.setUpdatedAt(now());
    return injectRepository.save(inject);
  }

  /**
   * Update the inject with the given input
   *
   * @param injectToUpdate the inject to update
   * @param operations the operation to perform, with the values to add, remove or replace
   * @param teamsFromDB the teams from the DB, coming from the input values
   * @param assetsFromDB the assets from the DB, coming from the input values
   * @param assetGroupsFromDB the asset groups from the DB, coming from the input values
   */
  private void applyUpdateOperation(
      Inject injectToUpdate,
      List<InjectBulkUpdateOperation> operations,
      Map<String, Team> teamsFromDB,
      Map<String, Asset> assetsFromDB,
      Map<String, AssetGroup> assetGroupsFromDB) {
    if (CollectionUtils.isEmpty(operations)) {
      return;
    }

    for (var operation : operations) {
      switch (operation.getField()) {
        case TEAMS ->
            updateInjectEntities(
                injectToUpdate.getTeams(),
                operation.getValues(),
                teamsFromDB,
                operation.getOperation());
        case ASSETS ->
            updateInjectEntities(
                injectToUpdate.getAssets(),
                operation.getValues(),
                assetsFromDB,
                operation.getOperation());
        case ASSET_GROUPS ->
            updateInjectEntities(
                injectToUpdate.getAssetGroups(),
                operation.getValues(),
                assetGroupsFromDB,
                operation.getOperation());
        default ->
            throw new BadRequestException("Invalid field to update: " + operation.getField());
      }
    }
  }

  /**
   * Update the inject entities
   *
   * @param injectEntities the inject entities to update
   * @param newValuesIDs the IDs of the value to add, remove or replace
   * @param entitiesFromDB the entities from the DB
   * @param operation the operation to apply
   * @param <T> the type of the entities
   */
  private <T> void updateInjectEntities(
      List<T> injectEntities,
      List<String> newValuesIDs,
      Map<String, T> entitiesFromDB,
      InjectBulkUpdateSupportedOperations operation) {
    if (operation == InjectBulkUpdateSupportedOperations.REPLACE) {
      injectEntities.clear();
    }
    newValuesIDs.forEach(
        id -> {
          T entity = entitiesFromDB.get(id);
          if (entity == null) {
            log.warning("Inject update entity with ID " + id + " not found in the DB");
            return;
          }

          switch (operation) {
            case REPLACE, ADD -> {
              if (!injectEntities.contains(entity)) {
                injectEntities.add(entity);
              }
            }
            case REMOVE -> injectEntities.remove(entity);
            default ->
                throw new BadRequestException(
                    "Invalid operation to update inject entities: " + operation);
          }
        });
  }

  public AgentsAndAssetsAgentless getAgentsAndAgentlessAssetsByInject(Inject inject) {
    Set<Agent> agents = new HashSet<>();
    Set<Asset> assetsAgentless = new HashSet<>();

    for (Asset asset : inject.getAssets()) {
      extractAgentsAndAssetsAgentless(agents, assetsAgentless, asset);
    }

    for (AssetGroup assetGroup : inject.getAssetGroups()) {
      for (Asset asset : assetGroupService.assetsFromAssetGroup(assetGroup.getId())) {
        extractAgentsAndAssetsAgentless(agents, assetsAgentless, asset);
      }
    }

    return new AgentsAndAssetsAgentless(agents, assetsAgentless);
  }

  private void extractAgentsAndAssetsAgentless(
      Set<Agent> agents, Set<Asset> assetsAgentless, Asset asset) {
    List<Agent> collectedAgents =
        Optional.ofNullable(((Endpoint) Hibernate.unproxy(asset)).getAgents())
            .orElse(Collections.emptyList());
    if (collectedAgents.isEmpty()) {
      assetsAgentless.add(asset);
    } else {
      for (Agent agent : collectedAgents) {
        if (isPrimaryAgent(agent)) {
          agents.add(agent);
        }
      }
    }
  }

  public List<Agent> getAgentsByInject(Inject inject) {
    List<Agent> agents = new ArrayList<>();
    Set<String> agentIds = new HashSet<>();

    Consumer<Asset> extractAgents =
        asset -> {
          List<Agent> collectedAgents =
              Optional.ofNullable(((Endpoint) Hibernate.unproxy(asset)).getAgents())
                  .orElse(Collections.emptyList());
          for (Agent agent : collectedAgents) {
            if (isPrimaryAgent(agent) && !agentIds.contains(agent.getId())) {
              agents.add(agent);
              agentIds.add(agent.getId());
            }
          }
        };

    new ArrayList<>(inject.getAssets()).forEach(extractAgents);
    inject.getAssetGroups().stream()
        .flatMap(assetGroup -> assetGroupService.assetsFromAssetGroup(assetGroup.getId()).stream())
        .forEach(extractAgents);

    return agents;
  }

  public List<FilterUtilsJpa.Option> getOptionsByNameLinkedToFindings(
      String searchText, String sourceId, Pageable pageable) {
    String trimmedSearchText = StringUtils.trimToNull(searchText);
    String trimmedSimulationOrScenarioId = StringUtils.trimToNull(sourceId);

    List<Object[]> results;

    if (trimmedSimulationOrScenarioId == null) {
      results = injectRepository.findAllByTitleLinkedToFindings(trimmedSearchText, pageable);
    } else {
      results =
          injectRepository.findAllByTitleLinkedToFindingsWithContext(
              trimmedSimulationOrScenarioId, trimmedSearchText, pageable);
    }

    return results.stream()
        .map(i -> new FilterUtilsJpa.Option((String) i[0], (String) i[1]))
        .toList();
  }

  public List<ExecutionTraceOutput> getInjectTracesFromInjectAndTarget(
      final String injectId, final String targetId, final TargetType targetType) {
    switch (targetType) {
      case AGENT:
        return injectExecutionMapper.toExecutionTracesOutput(
            this.executionTraceRepository.findByInjectIdAndAgentId(injectId, targetId));
      case ASSETS:
        return injectExecutionMapper.toExecutionTracesOutput(
            this.executionTraceRepository.findByInjectIdAndAssetId(injectId, targetId));
      case TEAMS:
        return injectExecutionMapper.toExecutionTracesOutput(
            this.executionTraceRepository.findByInjectIdAndTeamId(injectId, targetId));
      case PLAYERS:
        return injectExecutionMapper.toExecutionTracesOutput(
            this.executionTraceRepository.findByInjectIdAndPlayerId(injectId, targetId));
      default:
        throw new BadRequestException("Target type " + targetType + " is not supported");
    }
  }

  public InjectExecutionOutput getInjectStatusWithGlobalExecutionTraces(String injectId) {
    return injectExecutionMapper.toInjectExecutionOutput(
        injectExecutionRepository.findInjectExecutionWithGlobalExecutionTraces(injectId));
  }
}
