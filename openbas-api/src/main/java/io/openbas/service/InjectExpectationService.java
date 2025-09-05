package io.openbas.service;

import static io.openbas.collectors.expectations_expiration_manager.utils.ExpectationUtils.computeFailedMessage;
import static io.openbas.collectors.expectations_expiration_manager.utils.ExpectationUtils.computeSuccessMessage;
import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.*;
import static io.openbas.database.model.InjectExpectationSignature.EXPECTATION_SIGNATURE_TYPE_END_DATE;
import static io.openbas.database.model.InjectExpectationSignature.EXPECTATION_SIGNATURE_TYPE_START_DATE;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.service.InjectExpectationUtils.computeScore;
import static io.openbas.service.InjectExpectationUtils.expectationConverter;
import static io.openbas.utils.ExpectationUtils.HUMAN_EXPECTATION;
import static io.openbas.utils.inject_expectation_result.InjectExpectationResultUtils.*;
import static java.time.Instant.now;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.database.specification.InjectExpectationSpecification;
import io.openbas.execution.ExecutableInject;
import io.openbas.expectation.ExpectationPropertiesConfig;
import io.openbas.expectation.ExpectationType;
import io.openbas.model.Expectation;
import io.openbas.rest.collector.service.CollectorService;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import io.openbas.rest.inject.form.InjectExpectationUpdateInput;
import io.openbas.utils.ExpectationUtils;
import io.openbas.utils.TargetType;
import jakarta.annotation.Nullable;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@RequiredArgsConstructor
@Service
public class InjectExpectationService {

  public static final String SUCCESS = "Success";
  public static final String FAILED = "Failed";
  public static final String PENDING = "Pending";
  public static final String COLLECTOR = "collector";
  private final InjectExpectationRepository injectExpectationRepository;
  private final AssetGroupService assetGroupService;
  private final EndpointService endpointService;
  private final CollectorService collectorService;
  @Resource private ExpectationPropertiesConfig expectationPropertiesConfig;

  @Resource protected ObjectMapper mapper;

  // -- CRUD --

  public Optional<InjectExpectation> findInjectExpectation(
      @NotBlank final String injectExpectationId) {
    return this.injectExpectationRepository.findById(injectExpectationId);
  }

  // -- UPDATE FROM UI --

  public InjectExpectation updateInjectExpectation(
      @NotBlank final String expectationId, @NotNull final ExpectationUpdateInput input) {
    InjectExpectation injectExpectation =
        this.injectExpectationRepository.findById(expectationId).orElseThrow();
    InjectExpectationResult injectExpectationResult =
        findResultBySourceId(injectExpectation.getResults(), input.getSourceId());

    String result;
    if (HUMAN_EXPECTATION.contains(injectExpectation.getType())) {
      result = input.getScore() >= injectExpectation.getExpectedScore() ? SUCCESS : FAILED;
      injectExpectation.getResults().clear();
    } else if (DETECTION.equals(injectExpectation.getType())) {
      if (input.getScore() >= injectExpectation.getExpectedScore()) {
        result = ExpectationType.DETECTION.successLabel;
      } else if (input.getScore() > 0) {
        result = ExpectationType.DETECTION.partialLabel;
      } else {
        result = ExpectationType.DETECTION.failureLabel;
      }
    } else if (PREVENTION.equals(injectExpectation.getType())) {
      if (input.getScore() >= injectExpectation.getExpectedScore()) {
        result = ExpectationType.PREVENTION.successLabel;
      } else if (input.getScore() > 0) {
        result = ExpectationType.PREVENTION.partialLabel;
      } else {
        result = ExpectationType.PREVENTION.failureLabel;
      }
    } else {
      result = "";
    }
    if (injectExpectationResult != null) {
      injectExpectationResult.setResult(result);
      injectExpectationResult.setScore(input.getScore());
      injectExpectationResult.setDate(now().toString());
    } else {
      injectExpectation.getResults().add(build(input, result));
    }
    if (injectExpectation.getScore() == null) {
      injectExpectation.setScore(input.getScore());
    } else {
      if (input.getScore() > injectExpectation.getScore()
          || HUMAN_EXPECTATION.contains(injectExpectation.getType())) {
        injectExpectation.setScore(input.getScore());
      } else {
        injectExpectation.setScore(
            Collections.max(
                injectExpectation.getResults().stream()
                    .map(InjectExpectationResult::getScore)
                    .filter(Objects::nonNull)
                    .toList()));
      }
    }
    injectExpectation.setUpdatedAt(now());
    InjectExpectation updated = this.injectExpectationRepository.save(injectExpectation);

    boolean isAssetGroupExpectation = updated.getAssetGroup() != null && updated.getAsset() == null;
    boolean isAssetExpectation = updated.getAsset() != null && updated.getAgent() == null;

    if (isAssetGroupExpectation) {
      // Update InjectExpectations for Assets linked to this asset group
      updateInjectExpectationAsset(input, updated, result);
    } else if (isAssetExpectation) {
      // Update InjectExpectations for Agents linked to this asset
      updateInjectExpectationAgent(input, updated, result);
    }

    // If the expectation is type manual, We should update expectations for teams and players
    if (HUMAN_EXPECTATION.contains(injectExpectation.getType()) && updated.getTeam() != null) {
      computeExpectationsForTeamsAndPlayer(updated, result);
    }
    return updated;
  }

  private void updateInjectExpectation(
      ExpectationUpdateInput input, InjectExpectation updated, String result, boolean isAsset) {
    List<InjectExpectation> expectations =
        isAsset
            ? this.expectationsForAssets(
                updated.getInject(), updated.getAssetGroup(), updated.getType())
            : this.expectationsForAgents(
                updated.getInject(),
                updated.getAsset(),
                updated.getAssetGroup(),
                updated.getType());

    expectations.forEach(
        expectation -> {
          expectation.getResults().add(build(input, result));
          expectation.setScore(updated.getScore());
          expectation.setUpdatedAt(updated.getUpdatedAt());
          if (isAsset) {
            updateInjectExpectationAgent(input, expectation, result);
          }
        });

    injectExpectationRepository.saveAll(expectations);
  }

  private void updateInjectExpectationAsset(
      ExpectationUpdateInput input, InjectExpectation updated, String result) {
    updateInjectExpectation(input, updated, result, true);
  }

  private void updateInjectExpectationAgent(
      ExpectationUpdateInput input, InjectExpectation updated, String result) {
    updateInjectExpectation(input, updated, result, false);
  }

  // -- DELETE RESULT FROM UI --

  public InjectExpectation deleteInjectExpectationResult(
      @NotBlank final String expectationId, @NotBlank final String sourceId) {
    InjectExpectation injectExpectation =
        this.injectExpectationRepository.findById(expectationId).orElseThrow();
    InjectExpectationResult result = findResultBySourceId(injectExpectation.getResults(), sourceId);
    if (result != null) {
      injectExpectation.setResults(
          injectExpectation.getResults().stream()
              .filter(r -> !sourceId.equals(r.getSourceId()))
              .toList());
      if (List.of(MANUAL, ARTICLE, CHALLENGE).contains(injectExpectation.getType())) {
        injectExpectation.setScore(null);
      } else {
        List<Double> scores =
            injectExpectation.getResults().stream()
                .map(InjectExpectationResult::getScore)
                .filter(Objects::nonNull)
                .toList();
        injectExpectation.setScore(!scores.isEmpty() ? Collections.max(scores) : 0.0);
      }
    }
    injectExpectation.setUpdatedAt(now());
    InjectExpectation updated = this.injectExpectationRepository.save(injectExpectation);

    boolean isAssetGroupExpectation = updated.getAssetGroup() != null && updated.getAsset() == null;
    boolean isAssetExpectation = updated.getAsset() != null && updated.getAgent() == null;

    if (isAssetGroupExpectation) {
      // Delete result InjectExpectations for Assets linked to this asset group
      deleteInjectExpectationResultAsset(sourceId, updated);
    } else if (isAssetExpectation) {
      // Delete InjectExpectations results for Agents installed on this asset
      deleteInjectExpectationResultAgent(sourceId, updated);
    }

    // If The expectation is type manual, We should update expectations for teams and players
    if (List.of(MANUAL, ARTICLE, CHALLENGE).contains(injectExpectation.getType())
        && updated.getTeam() != null) {
      computeExpectationsForTeamsAndPlayer(updated, null);
    }

    return updated;
  }

  private void deleteInjectExpectationResult(
      String sourceId, InjectExpectation updated, boolean isAsset) {
    List<InjectExpectation> expectations =
        isAsset
            ? this.expectationsForAssets(
                updated.getInject(), updated.getAssetGroup(), updated.getType())
            : this.expectationsForAgents(
                updated.getInject(),
                updated.getAsset(),
                updated.getAssetGroup(),
                updated.getType());

    expectations.forEach(
        expectation -> {
          expectation.setResults(
              expectation.getResults().stream()
                  .filter(r -> !sourceId.equals(r.getSourceId()))
                  .toList());
          expectation.setScore(updated.getScore());
          expectation.setUpdatedAt(updated.getUpdatedAt());
          if (isAsset) {
            deleteInjectExpectationResultAgent(sourceId, expectation);
          }
        });

    injectExpectationRepository.saveAll(expectations);
  }

  private void deleteInjectExpectationResultAsset(String sourceId, InjectExpectation updated) {
    deleteInjectExpectationResult(sourceId, updated, true);
  }

  private void deleteInjectExpectationResultAgent(String sourceId, InjectExpectation updated) {
    deleteInjectExpectationResult(sourceId, updated, false);
  }

  // -- COMMUN --

  private void computeExpectationsForTeamsAndPlayer(InjectExpectation updated, String result) {
    // If the updated expectation was a player expectation, We have to update the team expectation
    // using player expectations (based on validation type)
    if (updated.getUser() != null) {
      List<InjectExpectation> toProcess =
          injectExpectationRepository.findAllByInjectAndTeamAndExpectationName(
              updated.getInject().getId(), updated.getTeam().getId(), updated.getName());
      InjectExpectation parentExpectation =
          toProcess.stream()
              .filter(exp -> exp.getUser() == null)
              .findFirst()
              .orElseThrow(ElementNotFoundException::new);
      List<InjectExpectation> playersExpectations =
          toProcess.stream().filter(exp -> exp.getUser() != null).toList();
      List<InjectExpectation> playersAnsweredExpectations =
          playersExpectations.stream().filter(exp -> exp.getScore() != null).toList();

      if (updated.isExpectationGroup()) { // If At least one player
        List<InjectExpectation> successPlayerExpectations =
            playersExpectations.stream()
                .filter(exp -> exp.getScore() != null)
                .filter(exp -> exp.getScore() >= updated.getExpectedScore())
                .toList();

        if (!successPlayerExpectations.isEmpty()) { // At least one player success
          result = SUCCESS;
          OptionalDouble avgSuccessPlayer =
              successPlayerExpectations.stream().mapToDouble(InjectExpectation::getScore).average();
          parentExpectation.setScore(avgSuccessPlayer.getAsDouble());
        } else if (playersAnsweredExpectations.size()
            == playersExpectations.size()) { // All players had answers and no one success
          result = FAILED;
          parentExpectation.setScore(0.0);
        } else {
          result = PENDING;
          parentExpectation.setScore(null);
        }

      } else { // All Player
        boolean hasFailedPlayer =
            playersExpectations.stream()
                .filter(exp -> exp.getScore() != null)
                .anyMatch(exp -> exp.getScore() < updated.getExpectedScore());

        if (hasFailedPlayer) {
          result = FAILED;
        } else if (playersAnsweredExpectations.size()
            == playersExpectations.size()) { // All players answered and no failures
          result = SUCCESS;
        } else { // Some players haven't answered yet
          result = PENDING;
          parentExpectation.setScore(null);
        }

        if (!result.equals(PENDING)) {
          OptionalDouble avgAllPlayer =
              playersAnsweredExpectations.stream()
                  .mapToDouble(InjectExpectation::getScore)
                  .average();
          parentExpectation.setScore(avgAllPlayer.orElse(0.0));
        }
      }

      parentExpectation.setUpdatedAt(Instant.now());
      parentExpectation.getResults().clear();
      parentExpectation
          .getResults()
          .add(buildForPlayerManualValidation(result, parentExpectation.getScore()));
      injectExpectationRepository.save(parentExpectation);

    } else {
      // If I update the expectation team: What happens with children? -> update expectation score
      // for all children -> set score from InjectExpectation
      List<InjectExpectation> toProcess =
          injectExpectationRepository.findAllByInjectAndTeamAndExpectationNameAndUserIsNotNull(
              updated.getInject().getId(), updated.getTeam().getId(), updated.getName());
      for (InjectExpectation expectation : toProcess) {
        expectation.setScore(updated.getScore());
        expectation.setUpdatedAt(Instant.now());
        expectation.getResults().clear();
        if (result != null) {
          expectation.getResults().add(buildForTeamManualValidation(result, updated.getScore()));
        }
        injectExpectationRepository.save(expectation);
      }
    }
  }

  // -- UPDATE FROM EXTERNAL SOURCE : COLLECTORS --

  public InjectExpectation updateInjectExpectation(
      @NotBlank String expectationId, @Valid @NotNull InjectExpectationUpdateInput input) {
    InjectExpectation injectExpectation =
        this.findInjectExpectation(expectationId).orElseThrow(ElementNotFoundException::new);
    Collector collector = this.collectorService.collector(input.getCollectorId());

    List<InjectExpectation> updated =
        computeExpectationCascading(injectExpectation, collector, input);
    this.updateAll(updated);

    return injectExpectation;
  }

  public void bulkUpdateInjectExpectation(
      @Valid @NotNull Map<String, InjectExpectationUpdateInput> inputs) {
    if (inputs.isEmpty()) {
      return;
    }

    List<InjectExpectation> injectExpectations =
        fromIterable(this.injectExpectationRepository.findAllById(inputs.keySet()));
    Map<String, InjectExpectation> expectationsToUpdate =
        injectExpectations.stream().collect(Collectors.toMap(InjectExpectation::getId, e -> e));

    Collector collector =
        this.collectorService.collector(
            inputs.values().stream()
                .findFirst()
                .orElseThrow(ElementNotFoundException::new)
                .getCollectorId());

    // Update inject expectation at agent level
    for (Map.Entry<String, InjectExpectationUpdateInput> entry : inputs.entrySet()) {
      String injectExpectationId = entry.getKey();
      InjectExpectationUpdateInput input = entry.getValue();

      InjectExpectation injectExpectation = expectationsToUpdate.get(injectExpectationId);
      if (injectExpectation == null) {
        log.error("Inject expectation not found for ID: {}", injectExpectationId);
        continue;
      }
      List<InjectExpectation> updated =
          computeExpectationCascading(injectExpectation, collector, input);
      this.updateAll(updated);
    }
  }

  public List<InjectExpectation> computeExpectationCascading(
      InjectExpectation injectExpectation,
      Collector collector,
      InjectExpectationUpdateInput input) {
    List<InjectExpectation> updated = new ArrayList<>();
    // Update inject expectation at agent level
    injectExpectation = this.computeExpectationAgent(injectExpectation, input, collector);
    updated.add(injectExpectation);

    Inject inject = injectExpectation.getInject();
    // Compute potential expectations for asset
    updated.addAll(propagateUpdateToAssets(injectExpectation, inject, collector));
    // Compute potential expectations for asset groups
    updated.addAll(propagateUpdateToAssetGroups(injectExpectation, inject, collector));
    return updated;
  }

  private List<InjectExpectation> propagateUpdateToAssets(
      InjectExpectation injectExpectation, Inject inject, Collector collector) {

    List<InjectExpectation> expectationAssets =
        inject.getExpectations().stream()
            .filter(ExpectationUtils::isAssetExpectation)
            .filter(e -> e.getAsset().getId().equals(injectExpectation.getAsset().getId()))
            .filter(e -> e.getType().equals(injectExpectation.getType()))
            .toList();

    List<InjectExpectation> allExpectationAgents =
        inject.getExpectations().stream()
            .filter(ExpectationUtils::isAgentExpectation)
            .filter(e -> e.getType().equals(injectExpectation.getType()))
            .toList();

    List<InjectExpectation> updated = new ArrayList<>();
    expectationAssets.forEach(
        (expectationAsset -> {
          List<InjectExpectation> expectationAgents =
              allExpectationAgents.stream()
                  .filter(e -> e.getAsset().equals(expectationAsset.getAsset()))
                  .toList();
          // Every agent expectation (result by collector id) is filled
          if (expectationAgents.stream()
              .allMatch(e -> hasValidResultFromSource(e.getResults(), collector.getId()))) {
            // Update Asset inject expectation with new result and score
            updated.add(
                this.computeExpectationAsset(expectationAsset, expectationAgents, collector));
          }
        }));
    return updated;
  }

  private List<InjectExpectation> propagateUpdateToAssetGroups(
      InjectExpectation injectExpectation, Inject inject, Collector collector) {
    List<InjectExpectation> expectationAssetGroups =
        inject.getExpectations().stream()
            .filter(ExpectationUtils::isAssetGroupExpectation)
            .filter(
                e -> e.getAssetGroup().getId().equals(injectExpectation.getAssetGroup().getId()))
            .filter(e -> e.getType().equals(injectExpectation.getType()))
            .toList();

    List<InjectExpectation> allExpectationAssets =
        inject.getExpectations().stream()
            .filter(ExpectationUtils::isAssetExpectation)
            .filter(e -> e.getType().equals(injectExpectation.getType()))
            .toList();

    List<InjectExpectation> updated = new ArrayList<>();
    expectationAssetGroups.forEach(
        (expectationAssetGroup -> {
          List<InjectExpectation> expectationAssetsByAssetGroup =
              allExpectationAssets.stream()
                  .filter(e -> e.getAssetGroup().equals(expectationAssetGroup.getAssetGroup()))
                  .toList();
          // Every asset expectation is filled
          if (expectationAssetsByAssetGroup.stream()
              .allMatch(e -> hasValidResultFromSource(e.getResults(), collector.getId()))) {
            updated.add(
                this.computeExpectationAssetGroup(
                    expectationAssetGroup, expectationAssetsByAssetGroup, collector));
          }
        }));
    return updated;
  }

  // -- COMPUTE RESULTS FROM INJECT EXPECTATIONS --

  public InjectExpectation computeExpectationAgent(
      @NotNull final InjectExpectation expectation,
      @NotNull final InjectExpectationUpdateInput input,
      @NotNull final Collector collector) {
    double actualScore = computeScore(expectation, input.getIsSuccess());
    build(expectation, collector, input.getResult(), input.getIsSuccess(), input.getMetadata());
    expectation.setScore(actualScore);
    return expectation;
  }

  public InjectExpectation computeExpectationAsset(
      @NotNull final InjectExpectation expectationAsset,
      @NotNull final List<InjectExpectation> expectationAgents,
      @NotNull final Collector collector) {
    return processExpectation(expectationAsset, expectationAgents, collector, false);
  }

  public InjectExpectation computeExpectationAssetGroup(
      @NotNull final InjectExpectation expectationAssetGroup,
      @NotNull final List<InjectExpectation> expectationAssets,
      @NotNull final Collector collector) {
    return processExpectation(
        expectationAssetGroup,
        expectationAssets,
        collector,
        expectationAssetGroup.isExpectationGroup());
  }

  private boolean isSuccess(List<InjectExpectation> expectations, boolean isGroup) {
    if (expectations.isEmpty()) {
      return false;
    }

    return isGroup
        ? expectations.stream().anyMatch(e -> e.getExpectedScore().equals(e.getScore()))
        : expectations.stream().allMatch(e -> e.getExpectedScore().equals(e.getScore()));
  }

  private boolean isSuccessScoreResult(
      List<InjectExpectation> expectations, Collector collector, double expectedScore) {
    if (expectations.isEmpty()) {
      return false;
    }

    final List<InjectExpectationResult> allResults =
        expectations.stream().flatMap(exp -> exp.getResults().stream()).toList();

    if (hasNoResult(allResults, collector.getId())) {
      return false;
    }

    return allResults.stream()
        .filter(r -> collector.getId().equals(r.getSourceId()))
        .allMatch(r -> r.getScore() != null && r.getScore().equals(expectedScore));
  }

  private InjectExpectation processExpectation(
      InjectExpectation expectation,
      List<InjectExpectation> expectations,
      Collector collector,
      boolean isGroup) {

    boolean success = isSuccess(expectations, isGroup);
    boolean successScoreResult =
        isSuccessScoreResult(expectations, collector, expectation.getExpectedScore());
    double finalScore = computeScore(expectation, success);

    build(
        expectation,
        collector,
        successScoreResult
            ? computeSuccessMessage(expectation.getType())
            : computeFailedMessage(expectation.getType()),
        success,
        null);
    expectation.setScore(finalScore);
    return expectation;
  }

  // -- FINAL UPDATE --

  public void updateAll(@NotNull List<InjectExpectation> injectExpectations) {
    this.injectExpectationRepository.saveAll(injectExpectations);
  }

  // -- FETCH INJECT EXPECTATIONS --

  public List<InjectExpectation> expectationsNotFill() {
    return fromIterable(this.injectExpectationRepository.findAll()).stream()
        .filter(e -> hasAnyEmptyResult(e.getResults()))
        .toList();
  }

  public List<InjectExpectation> expectationsForAgents(
      @NotNull final Inject inject,
      @NotNull final Asset asset,
      @Nullable final AssetGroup assetGroup,
      @NotNull final InjectExpectation.EXPECTATION_TYPE expectationType) {

    Endpoint resolvedEndpoint = endpointService.endpoint(asset.getId());
    List<String> agentIds =
        resolvedEndpoint.getAgents().stream().map(Agent::getId).distinct().toList();

    Specification<InjectExpectation> spec =
        Specification.where(InjectExpectationSpecification.type(expectationType))
            .and(
                assetGroup != null
                    ? InjectExpectationSpecification.fromAssetGroup(assetGroup.getId())
                    : InjectExpectationSpecification.assetGroupIsNull())
            .and(InjectExpectationSpecification.fromAgents(inject.getId(), agentIds));

    return this.injectExpectationRepository.findAll(spec);
  }

  public List<InjectExpectation> expectationsForAssets(
      @NotNull final Inject inject,
      @NotNull final AssetGroup assetGroup,
      @NotNull final InjectExpectation.EXPECTATION_TYPE expectationType) {
    AssetGroup resolvedAssetGroup = assetGroupService.assetGroup(assetGroup.getId());
    List<String> assetIds =
        Stream.concat(
                resolvedAssetGroup.getAssets().stream(),
                resolvedAssetGroup.getDynamicAssets().stream())
            .map(Asset::getId)
            .distinct()
            .toList();
    return this.injectExpectationRepository.findAll(
        Specification.where(InjectExpectationSpecification.type(expectationType))
            .and(InjectExpectationSpecification.fromAssetGroup(assetGroup.getId()))
            .and(InjectExpectationSpecification.fromAssets(inject.getId(), assetIds)));
  }

  // -- PREVENTION --

  public List<InjectExpectation> preventionExpectationsNotExpired(final Integer expirationTime) {
    return this.injectExpectationRepository.findAll(
        Specification.where(
            InjectExpectationSpecification.type(PREVENTION)
                .and(InjectExpectationSpecification.agentNotNull())
                .and(InjectExpectationSpecification.assetNotNull())
                .and(
                    InjectExpectationSpecification.from(
                        Instant.now().minus(expirationTime, ChronoUnit.MINUTES)))));
  }

  public List<InjectExpectation> preventionExpectationsNotFill(@NotBlank final String sourceId) {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(PREVENTION)))
        .stream()
        .filter(ExpectationUtils::isAgentExpectation)
        .filter(e -> hasNoResultForSource(e.getResults(), sourceId))
        .toList();
  }

  public List<InjectExpectation> preventionExpectationsNotFill() {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(PREVENTION)))
        .stream()
        .filter(ExpectationUtils::isAgentExpectation)
        .filter(e -> hasNoResults(e.getResults()))
        .toList();
  }

  // -- DETECTION --

  public List<InjectExpectation> detectionExpectationsNotExpired(final Integer expirationTime) {
    return this.injectExpectationRepository.findAll(
        Specification.where(
            InjectExpectationSpecification.type(DETECTION)
                .and(InjectExpectationSpecification.agentNotNull())
                .and(InjectExpectationSpecification.assetNotNull())
                .and(
                    InjectExpectationSpecification.from(
                        Instant.now().minus(expirationTime, ChronoUnit.MINUTES)))));
  }

  public List<InjectExpectation> detectionExpectationsNotFill(@NotBlank final String sourceId) {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(DETECTION)))
        .stream()
        .filter(ExpectationUtils::isAgentExpectation)
        .filter(e -> hasNoResultForSource(e.getResults(), sourceId))
        .toList();
  }

  public List<InjectExpectation> detectionExpectationsNotFill() {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(DETECTION)))
        .stream()
        .filter(ExpectationUtils::isAgentExpectation)
        .filter(e -> hasNoResults(e.getResults()))
        .toList();
  }

  // -- MANUAL

  public List<InjectExpectation> manualExpectationsNotExpired(final Integer expirationTime) {
    return this.injectExpectationRepository.findAll(
        Specification.where(
            InjectExpectationSpecification.type(MANUAL)
                .and(InjectExpectationSpecification.agentNotNull())
                .and(InjectExpectationSpecification.assetNotNull())
                .and(
                    InjectExpectationSpecification.from(
                        Instant.now().minus(expirationTime, ChronoUnit.MINUTES)))));
  }

  public List<InjectExpectation> manualExpectationsNotFill(@NotBlank final String sourceId) {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(MANUAL)))
        .stream()
        .filter(e -> hasNoResultForSource(e.getResults(), sourceId))
        .toList();
  }

  public List<InjectExpectation> manualExpectationsNotFill() {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(MANUAL)))
        .stream()
        .filter(e -> hasNoResults(e.getResults()))
        .toList();
  }

  // -- BY TARGET TYPE

  public List<InjectExpectation> findMergedExpectationsByInjectAndTargetAndTargetType(
      @NotBlank final String injectId,
      @NotBlank final String targetId,
      @NotBlank final String targetType) {
    try {
      TargetType targetTypeEnum = TargetType.valueOf(targetType);
      return mergeExpectationResultsByExpectationType(
          switch (targetTypeEnum) {
            case TEAMS, ASSETS_GROUPS ->
                this.findMergedExpectationsByInjectAndTargetAndTargetType(
                    injectId, targetId, "not applicable", targetType);
            case PLAYERS ->
                injectExpectationRepository.findAllByInjectAndPlayer(injectId, targetId);
            case AGENT -> injectExpectationRepository.findAllByInjectAndAgent(injectId, targetId);
            case ASSETS -> injectExpectationRepository.findAllByInjectAndAsset(injectId, targetId);
            default ->
                throw new RuntimeException(
                    "Target type "
                        + targetType
                        + " not implemented for this method findMergedExpectationsByInjectAndTargetAndTargetType");
          });
    } catch (IllegalArgumentException e) {
      return Collections.emptyList();
    }
  }

  public List<InjectExpectation> findMergedExpectationsByInjectAndTargetAndTargetType(
      @NotBlank final String injectId,
      @NotBlank final String targetId,
      @NotBlank final String parentTargetId,
      @NotBlank final String targetType) {
    try {
      TargetType targetTypeEnum = TargetType.valueOf(targetType);
      return switch (targetTypeEnum) {
        case TEAMS -> injectExpectationRepository.findAllByInjectAndTeam(injectId, targetId);
        case PLAYERS ->
            injectExpectationRepository.findAllByInjectAndTeamAndPlayer(
                injectId, parentTargetId, targetId);
        case AGENT ->
            injectExpectationRepository.findAllByInjectAndAssetGroupAndAgent(
                injectId, parentTargetId, targetId);
        case ASSETS ->
            injectExpectationRepository.findAllByInjectAndAssetGroupAndAsset(
                injectId, parentTargetId, targetId);
        case ASSETS_GROUPS ->
            injectExpectationRepository.findAllByInjectAndAssetGroup(injectId, targetId);
        default ->
            throw new RuntimeException(
                "Target type "
                    + targetType
                    + " not implemented for this method findMergedExpectationsByInjectAndTargetAndTargetType");
      };
    } catch (IllegalArgumentException e) {
      return Collections.emptyList();
    }
  }

  /**
   * Add a date signature to all inject expectations by agent.
   *
   * @param injectId the injectId for which to add the end date signature
   * @param agentId the agentId for which to add the end date signature
   * @param date the date to set as the signature value
   * @param signatureType the type of signature to add (start date or end date)
   */
  private void addDateSignatureToInjectExpectationsByAgent(
      @NotBlank final String injectId,
      @NotBlank final String agentId,
      @NotBlank final Instant date,
      @NotBlank final String signatureType) {
    List<InjectExpectation> injectExpectations =
        this.injectExpectationRepository.findAllByInjectAndAgent(injectId, agentId);

    injectExpectations.forEach(
        expectation -> {
          List<InjectExpectationSignature> signatures = expectation.getSignatures();
          signatures.add(new InjectExpectationSignature(signatureType, date.toString()));
        });

    injectExpectationRepository.saveAll(injectExpectations);
  }

  /**
   * Create a new End Date InjectExpectationSignature by a given agent.
   *
   * @param injectId the injectId for which to add the end date signature
   * @param agentId the agentId for which to add the end date signature
   * @param date the date to set as the end date signature
   */
  public void addEndDateSignatureToInjectExpectationsByAgent(
      @NotBlank final String injectId,
      @NotBlank final String agentId,
      @NotBlank final Instant date) {
    addDateSignatureToInjectExpectationsByAgent(
        injectId, agentId, date, EXPECTATION_SIGNATURE_TYPE_END_DATE);
  }

  /**
   * Create a new Start Date InjectExpectationSignature by a given agent.
   *
   * @param injectId the injectId for which to add the start date signature
   * @param agentId the agentId for which to add the start date signature
   * @param date the date to set as the start date signature
   */
  public void addStartDateSignatureToInjectExpectationsByAgent(
      @NotBlank final String injectId,
      @NotBlank final String agentId,
      @NotBlank final Instant date) {
    addDateSignatureToInjectExpectationsByAgent(
        injectId, agentId, date, EXPECTATION_SIGNATURE_TYPE_START_DATE);
  }

  private List<InjectExpectation> mergeExpectationResultsByExpectationType(
      List<InjectExpectation> expectations) {
    List<String> notCopiedSourceTypes = List.of(COLLECTOR);

    HashMap<InjectExpectation.EXPECTATION_TYPE, InjectExpectation> electedExpectations =
        new HashMap<>();
    for (InjectExpectation expectation : expectations) {
      if (!electedExpectations.containsKey(expectation.getType())) {
        electedExpectations.put(expectation.getType(), expectation);
        continue;
      }

      for (InjectExpectationResult expectationResult : expectation.getResults()) {
        if (!notCopiedSourceTypes.contains(expectationResult.getSourceType())) {
          electedExpectations
              .get(expectation.getType())
              .setResults(
                  Stream.concat(
                          electedExpectations.get(expectation.getType()).getResults().stream(),
                          Stream.of(expectationResult))
                      .toList());
          electedExpectations
              .get(expectation.getType())
              .setScore(
                  Collections.max(
                      electedExpectations.get(expectation.getType()).getResults().stream()
                          .map(InjectExpectationResult::getScore)
                          .toList()));
        }
      }
    }
    return electedExpectations.values().stream().toList();
  }

  // -- BUILD AND SAVE INJECT EXPECTATION --

  @Transactional
  public void buildAndSaveInjectExpectations(
      ExecutableInject executableInject, List<Expectation> expectations) {
    if (expectations == null || expectations.isEmpty()) {
      return;
    }

    final boolean isAtomicTesting = executableInject.getInjection().getInject().isAtomicTesting();
    final boolean isScheduledInject = !executableInject.isDirect();

    if (!isScheduledInject && !isAtomicTesting) {
      return;
    }

    // Create the expectations
    final List<Team> teams = executableInject.getTeams();
    final List<Asset> assets = executableInject.getAssets();
    final List<AssetGroup> assetGroups = executableInject.getAssetGroups();

    List<InjectExpectation> injectExpectations = new ArrayList<>();
    if (!teams.isEmpty()) {
      final String exerciseId = executableInject.getInjection().getExercise().getId();

      List<InjectExpectation> injectExpectationsByUserAndTeam;
      // If atomicTesting, We create expectation for every player and every team
      if (isAtomicTesting) {
        injectExpectations =
            teams.stream()
                .flatMap(
                    team ->
                        expectations.stream()
                            .map(
                                expectation ->
                                    expectationConverter(
                                        team,
                                        executableInject,
                                        expectation,
                                        expectationPropertiesConfig)))
                .collect(Collectors.toList());

        injectExpectationsByUserAndTeam =
            teams.stream()
                .flatMap(
                    team ->
                        team.getUsers().stream()
                            .flatMap(
                                user ->
                                    expectations.stream()
                                        .map(
                                            expectation ->
                                                expectationConverter(
                                                    team,
                                                    user,
                                                    executableInject,
                                                    expectation,
                                                    expectationPropertiesConfig))))
                .toList();
      } else {
        // Create expectations for every enabled player in every team
        injectExpectationsByUserAndTeam =
            teams.stream()
                .flatMap(
                    team ->
                        team.getExerciseTeamUsers().stream()
                            .filter(
                                exerciseTeamUser ->
                                    exerciseTeamUser.getExercise().getId().equals(exerciseId))
                            .flatMap(
                                exerciseTeamUser ->
                                    expectations.stream()
                                        .map(
                                            expectation ->
                                                expectationConverter(
                                                    team,
                                                    exerciseTeamUser.getUser(),
                                                    executableInject,
                                                    expectation,
                                                    expectationPropertiesConfig))))
                .toList();

        // Create a set of teams that have at least one enabled player
        Set<Team> teamsWithEnabledPlayers =
            injectExpectationsByUserAndTeam.stream()
                .map(InjectExpectation::getTeam)
                .collect(Collectors.toSet());

        // Add only the expectations where the team has at least one enabled player
        injectExpectations =
            teamsWithEnabledPlayers.stream()
                .flatMap(
                    team ->
                        expectations.stream()
                            .map(
                                expectation ->
                                    expectationConverter(
                                        team,
                                        executableInject,
                                        expectation,
                                        expectationPropertiesConfig)))
                .collect(Collectors.toList());
      }
      injectExpectations.addAll(injectExpectationsByUserAndTeam);
    } else if (!assets.isEmpty() || !assetGroups.isEmpty()) {
      injectExpectations =
          expectations.stream()
              .map(
                  expectation ->
                      expectationConverter(
                          executableInject, expectation, expectationPropertiesConfig))
              .collect(Collectors.toList());
    }

    if (!injectExpectations.isEmpty()) {
      setupExpectationResults(injectExpectations);
      injectExpectationRepository.saveAll(injectExpectations);
    }
  }

  private void setupExpectationResults(@NotNull final List<InjectExpectation> injectExpectations) {
    List<Collector> collectors = collectorService.securityPlatformCollectors();
    injectExpectations.stream()
        .filter(ie -> List.of(PREVENTION, DETECTION).contains(ie.getType()))
        .forEach(
            injectExpectation -> injectExpectation.setResults(setUpFromCollectors(collectors)));
  }
}
