package io.openbas.model.expectation;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.DETECTION;

import io.openbas.database.model.Asset;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectationSignature;
import io.openbas.model.Expectation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Objects;
import javax.annotation.Nullable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DetectionExpectation implements Expectation {

  private Double score;
  private String name;
  private String description;
  private Asset asset;
  private AssetGroup assetGroup;
  private boolean expectationGroup;
  private Long expirationTime;
  private List<InjectExpectationSignature> injectExpectationSignatures;

  private DetectionExpectation() {}

  @Override
  public InjectExpectation.EXPECTATION_TYPE type() {
    return DETECTION;
  }

  public static DetectionExpectation detectionExpectationForAsset(
      @Nullable final Double score,
      @NotBlank final String name,
      final String description,
      @NotNull final Asset asset,
      final boolean expectationGroup,
      final Long expirationTime,
      final List<InjectExpectationSignature> expectationSignatures) {
    DetectionExpectation detectionExpectation = new DetectionExpectation();
    detectionExpectation.setScore(Objects.requireNonNullElse(score, 100.0));
    detectionExpectation.setName(name);
    detectionExpectation.setDescription(description);
    detectionExpectation.setAsset(asset);
    detectionExpectation.setExpectationGroup(expectationGroup);
    detectionExpectation.setExpirationTime(expirationTime);
    detectionExpectation.setInjectExpectationSignatures(expectationSignatures);
    return detectionExpectation;
  }

  public static DetectionExpectation detectionExpectationForAssetGroup(
      @Nullable final Double score,
      @NotBlank final String name,
      final String description,
      @NotNull final AssetGroup assetGroup,
      final boolean expectationGroup,
      final Long expirationTime,
      final List<InjectExpectationSignature> expectationSignatures) {
    DetectionExpectation detectionExpectation = new DetectionExpectation();
    detectionExpectation.setScore(Objects.requireNonNullElse(score, 100.0));
    detectionExpectation.setName(name);
    detectionExpectation.setDescription(description);
    detectionExpectation.setAssetGroup(assetGroup);
    detectionExpectation.setExpectationGroup(expectationGroup);
    detectionExpectation.setExpirationTime(expirationTime);
    detectionExpectation.setInjectExpectationSignatures(expectationSignatures);
    return detectionExpectation;
  }
}
