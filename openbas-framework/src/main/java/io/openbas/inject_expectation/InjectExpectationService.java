package io.openbas.inject_expectation;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.*;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.inject_expectation.InjectExpectationUtils.computeResult;
import static java.time.Instant.now;

import io.openbas.asset.AssetGroupService;
import io.openbas.atomic_testing.TargetType;
import io.openbas.database.model.Asset;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.specification.InjectExpectationSpecification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class InjectExpectationService {

  private final InjectExpectationRepository injectExpectationRepository;
  private final InjectRepository injectRepository;
  private final AssetGroupService assetGroupService;

  // -- CRUD --

  public Optional<InjectExpectation> findInjectExpectation(
      @NotBlank final String injectExpectationId) {
    return this.injectExpectationRepository.findById(injectExpectationId);
  }

  public InjectExpectation computeExpectation(
      @NotNull final InjectExpectation expectation,
      @NotBlank final String sourceId,
      @NotBlank final String sourceType,
      @NotBlank final String sourceName,
      @NotBlank final String result,
      @NotBlank final Boolean success) {
    double actualScore =
        success
            ? expectation.getExpectedScore()
            : expectation.getScore() == null ? 0.0 : expectation.getScore();
    computeResult(expectation, sourceId, sourceType, sourceName, result, actualScore);
    expectation.setScore(actualScore);
    return this.update(expectation);
  }

  public void computeExpectationGroup(
      @NotNull final InjectExpectation expectationAssetGroup,
      @NotNull final List<InjectExpectation> expectationAssets,
      @NotBlank final String sourceId,
      @NotBlank final String sourceType,
      @NotBlank final String sourceName) {
    boolean success;
    if (expectationAssetGroup.isExpectationGroup()) {
      success =
          expectationAssets.stream().anyMatch((e) -> e.getExpectedScore().equals(e.getScore()));
    } else {
      success =
          expectationAssets.stream().allMatch((e) -> e.getExpectedScore().equals(e.getScore()));
    }
    computeResult(
        expectationAssetGroup,
        sourceId,
        sourceType,
        sourceName,
        success ? "SUCCESS" : "FAILED",
        success ? expectationAssetGroup.getExpectedScore() : 0);
    expectationAssetGroup.setScore(success ? expectationAssetGroup.getExpectedScore() : 0.0);
    this.update(expectationAssetGroup);
  }

  public InjectExpectation update(@NotNull InjectExpectation injectExpectation) {
    injectExpectation.setUpdatedAt(now());
    Inject inject = injectExpectation.getInject();
    inject.setUpdatedAt(now());
    this.injectRepository.save(inject);
    return this.injectExpectationRepository.save(injectExpectation);
  }

  // -- ALL --

  public List<InjectExpectation> expectationsNotFill() {
    return fromIterable(this.injectExpectationRepository.findAll()).stream()
        .filter(e -> e.getResults().stream().toList().isEmpty())
        .toList();
  }

  public List<InjectExpectation> expectationsNotFill(@NotBlank final String source) {
    return fromIterable(this.injectExpectationRepository.findAll()).stream()
        .filter(e -> e.getResults().stream().noneMatch(r -> source.equals(r.getSourceId())))
        .toList();
  }

  // -- PREVENTION --

  public List<InjectExpectation> preventionExpectationsNotFill(@NotBlank final String source) {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(PREVENTION)))
        .stream()
        .filter(e -> e.getAsset() != null)
        .filter(e -> e.getResults().stream().noneMatch(r -> source.equals(r.getSourceId())))
        .toList();
  }

  public List<InjectExpectation> preventionExpectationsNotFill() {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(PREVENTION)))
        .stream()
        .filter(e -> e.getAsset() != null)
        .filter(e -> e.getResults().stream().toList().isEmpty())
        .toList();
  }

  // -- DETECTION --

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
            .and(InjectExpectationSpecification.fromAssets(inject.getId(), assetIds)));
  }

  public List<InjectExpectation> detectionExpectationsNotFill(@NotBlank final String source) {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(DETECTION)))
        .stream()
        .filter(e -> e.getAsset() != null)
        .filter(e -> e.getResults().stream().noneMatch(r -> source.equals(r.getSourceId())))
        .toList();
  }

  public List<InjectExpectation> detectionExpectationsNotFill() {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(DETECTION)))
        .stream()
        .filter(e -> e.getAsset() != null)
        .filter(e -> e.getResults().stream().toList().isEmpty())
        .toList();
  }

  // -- MANUAL

  public List<InjectExpectation> manualExpectationsNotFill(@NotBlank final String source) {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(MANUAL)))
        .stream()
        .filter(e -> e.getResults().stream().noneMatch(r -> source.equals(r.getSourceId())))
        .toList();
  }

  public List<InjectExpectation> manualExpectationsNotFill() {
    return this.injectExpectationRepository
        .findAll(Specification.where(InjectExpectationSpecification.type(MANUAL)))
        .stream()
        .filter(e -> e.getResults().stream().toList().isEmpty())
        .toList();
  }

  // -- BY TARGET TYPE

  public List<InjectExpectation> findExpectationsByInjectAndTargetAndTargetType(
      @NotBlank final String injectId,
      @NotBlank final String targetId,
      @NotBlank final String parentTargetId,
      @NotBlank final String targetType) {
    try {
      TargetType targetTypeEnum = TargetType.valueOf(targetType);
      return switch (targetTypeEnum) {
        case TEAMS -> injectExpectationRepository.findAllByInjectAndTeam(injectId, targetId);
        case PLAYER ->
            injectExpectationRepository.findAllByInjectAndTeamAndPlayer(
                injectId, parentTargetId, targetId);
        case ASSETS -> injectExpectationRepository.findAllByInjectAndAsset(injectId, targetId);
        case ASSETS_GROUPS ->
            injectExpectationRepository.findAllByInjectAndAssetGroup(injectId, targetId);
      };
    } catch (IllegalArgumentException e) {
      return Collections.emptyList();
    }
  }
}
