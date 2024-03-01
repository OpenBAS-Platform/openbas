package io.openbas.model.expectation;

import io.openbas.database.model.Asset;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.model.Expectation;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import javax.annotation.Nullable;
import java.util.List;
import java.util.Objects;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.TECHNICAL;

@Getter
@Setter
public class TechnicalExpectation implements Expectation {

  private Integer score;
  private Asset asset;
  private List<Asset> assets;
  private AssetGroup assetGroup;
  private boolean expectationGroup;

  private TechnicalExpectation() {}

  public static TechnicalExpectation technicalExpectationForAsset(
      @Nullable final Integer score,
      @NotNull final Asset asset,
      boolean expectationGroup) {
    TechnicalExpectation technicalExpectation = new TechnicalExpectation();
    technicalExpectation.setScore(Objects.requireNonNullElse(score, 100));
    technicalExpectation.setAsset(asset);
    technicalExpectation.setExpectationGroup(expectationGroup);
    return technicalExpectation;
  }

  public static TechnicalExpectation technicalExpectationForAssetGroup(
      @Nullable final Integer score,
      @NotNull final AssetGroup assetGroup,
      boolean expectationGroup) {
    TechnicalExpectation technicalExpectation = new TechnicalExpectation();
    technicalExpectation.setScore(Objects.requireNonNullElse(score, 100));
    technicalExpectation.setAssetGroup(assetGroup);
    technicalExpectation.setExpectationGroup(expectationGroup);
    return technicalExpectation;
  }

  @Override
  public EXPECTATION_TYPE type() {
    return TECHNICAL;
  }

}
