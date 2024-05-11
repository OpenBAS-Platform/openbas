package io.openbas.inject_expectation;

import io.openbas.atomic_testing.TargetType;
import io.openbas.database.model.Asset;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.database.specification.InjectExpectationSpecification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.DETECTION;
import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.PREVENTION;
import static io.openbas.inject_expectation.InjectExpectationUtils.computeResult;
import static java.time.Instant.now;

@RequiredArgsConstructor
@Service
public class InjectExpectationService {

  private final InjectExpectationRepository injectExpectationRepository;

  // -- CRUD --

  public void addResultExpectation(
      @NotNull final InjectExpectation expectation,
      @NotBlank final String sourceId,
      @NotBlank final String sourceName,
      @NotBlank final String result) {
    computeResult(expectation, sourceId, sourceName, result);
    this.update(expectation);
  }

  public void computeExpectation(
      @NotNull final InjectExpectation expectation,
      @NotBlank final String sourceId,
      @NotBlank final String sourceName,
      @NotBlank final String result,
      @NotBlank final boolean success) {
    computeResult(expectation, sourceId, sourceName, result);
    expectation.setScore(success ? expectation.getExpectedScore() : 0);
    this.update(expectation);
  }

  public void computeExpectationGroup(
      @NotNull final InjectExpectation expectationAssetGroup,
      @NotNull final List<InjectExpectation> expectationAssets,
      @NotBlank final String sourceId,
      @NotBlank final String sourceName) {
    boolean success;
    if (expectationAssetGroup.isExpectationGroup()) {
      success = expectationAssets.stream().anyMatch((e) -> e.getExpectedScore().equals(e.getScore()));
    } else {
      success = expectationAssets.stream().allMatch((e) -> e.getExpectedScore().equals(e.getScore()));
    }
    computeResult(expectationAssetGroup, sourceId, sourceName, success ? "VALIDATED" : "FAILED");
    expectationAssetGroup.setScore(success ? expectationAssetGroup.getExpectedScore() : 0);
    this.update(expectationAssetGroup);
  }

  public void update(@NotNull InjectExpectation injectExpectation) {
    injectExpectation.setUpdatedAt(now());
    this.injectExpectationRepository.save(injectExpectation);
  }

  // -- PREVENTION --

  public InjectExpectation preventionExpectationForAsset(
      @NotNull final Inject inject,
      @NotBlank final String assetId) {
    return this.injectExpectationRepository.findPreventionExpectationForAsset(
        inject.getId(), assetId
    );
  }

  public List<InjectExpectation> preventionExpectationForAssets(
      @NotNull final Inject inject,
      @NotNull final AssetGroup assetGroup) {
    List<String> assetIds = assetGroup.getAssets().stream().map(Asset::getId).toList();
    return this.injectExpectationRepository.findAll(
        Specification.where(InjectExpectationSpecification.type(PREVENTION))
            .and(InjectExpectationSpecification.fromAssets(inject.getId(), assetIds))
    );
  }

  public InjectExpectation preventionExpectationForAssetGroup(
      @NotNull final Inject inject,
      @NotNull final AssetGroup assetGroup) {
    return this.injectExpectationRepository.findPreventionExpectationForAssetGroup(
        inject.getId(), assetGroup.getId()
    );
  }

  public List<InjectExpectation> preventionExpectationsNotFill(@NotBlank final String source) {
    return this.injectExpectationRepository.findAll(
            Specification.where(InjectExpectationSpecification.type(PREVENTION))
        )
        .stream()
        .filter(e -> e.getResults().stream().noneMatch(r -> source.equals(r.getSourceId())))
        .toList();
  }

  // -- DETECTION --

  public List<InjectExpectation> detectionExpectationsNotFill(@NotBlank final String source) {
    return this.injectExpectationRepository.findAll(
            Specification.where(InjectExpectationSpecification.type(DETECTION))
        )
        .stream()
        .filter(e -> e.getResults().stream().noneMatch(r -> source.equals(r.getSourceId())))
        .toList();
  }

  public List<InjectExpectation> expectationsForAssets(
      @NotNull final Inject inject,
      @NotNull final AssetGroup assetGroup,
      @NotNull final EXPECTATION_TYPE expectationType) {
    List<String> assetIds = assetGroup.getAssets().stream().map(Asset::getId).toList();
    return this.injectExpectationRepository.findAll(
        Specification.where(InjectExpectationSpecification.type(expectationType))
            .and(InjectExpectationSpecification.fromAssets(inject.getId(), assetIds))
    );
  }

  // -- BY TARGET TYPE

  public List<InjectExpectation> findExpectationsByInjectAndTargetAndTargetType(
      @NotBlank final String injectId,
      @NotBlank final String targetId,
      @NotBlank final String targetType) {
    try {
      TargetType targetTypeEnum = TargetType.valueOf(targetType);
      return switch (targetTypeEnum) {
        case TEAMS -> injectExpectationRepository.findAllByInjectAndTeam(injectId, targetId);
        case ASSETS -> injectExpectationRepository.findAllByInjectAndAsset(injectId, targetId);
        case ASSETS_GROUPS -> injectExpectationRepository.findAllByInjectAndAssetGroup(injectId, targetId);
      };
    } catch (IllegalArgumentException e) {
      return Collections.emptyList();
    }

  }

}
