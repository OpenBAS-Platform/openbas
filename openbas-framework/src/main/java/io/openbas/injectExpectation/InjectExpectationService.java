package io.openbas.injectExpectation;

import io.openbas.database.model.Asset;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.database.specification.InjectExpectationSpecification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.DETECTION;
import static io.openbas.database.specification.InjectExpectationSpecification.notFill;
import static java.time.Instant.now;

@RequiredArgsConstructor
@Service
public class InjectExpectationService {

  private final InjectExpectationRepository injectExpectationRepository;

  // -- CRUD --

  public void update(@NotNull InjectExpectation injectExpectation) {
    injectExpectation.setUpdatedAt(now());
    this.injectExpectationRepository.save(injectExpectation);
  }

  // -- TECHNICAL --

  public InjectExpectation technicalExpectationForAsset(
      @NotNull final Inject inject,
      @NotBlank final String assetId) {
    return this.injectExpectationRepository.findTechnicalExpectationForAsset(
        inject.getId(), assetId
    );
  }

  public List<InjectExpectation> technicalExpectationForAssets(
      @NotNull final Inject inject,
      @NotNull final AssetGroup assetGroup) {
    return this.injectExpectationRepository.findTechnicalExpectationsForAssets(
        inject.getId(), assetGroup.getAssets().stream().map(Asset::getId).toList()
    );
  }

  public InjectExpectation technicalExpectationForAssetGroup(
      @NotNull final Inject inject,
      @NotNull final AssetGroup assetGroup) {
    return this.injectExpectationRepository.findTechnicalExpectationForAssetGroup(
        inject.getId(), assetGroup.getId()
    );
  }

  // -- DETECTION --

  public List<InjectExpectation> detectionExpectationsNotFill() {
    return this.injectExpectationRepository.findAll(
        Specification.where(InjectExpectationSpecification.type(DETECTION))
            .and(notFill())
    );
  }

  public List<InjectExpectation> detectionExpectationsForAssets(
      @NotNull final Inject inject,
      @NotNull final AssetGroup assetGroup) {
    List<String> assetIds = assetGroup.getAssets().stream().map(Asset::getId).toList();
    return this.injectExpectationRepository.findAll(
        InjectExpectationSpecification.fromAssets(inject.getId(), assetIds)
    );
  }

}
