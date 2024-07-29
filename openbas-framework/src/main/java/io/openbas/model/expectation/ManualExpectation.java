package io.openbas.model.expectation;

import io.openbas.database.model.Asset;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.InjectExpectationSignature;
import io.openbas.model.Expectation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import javax.annotation.Nullable;
import java.util.List;
import java.util.Objects;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;

@Getter
@Setter
public class ManualExpectation implements Expectation {

  private Integer score;
  private String name;
  private String description;
  private Asset asset;
  private AssetGroup assetGroup;
  private boolean expectationGroup;

  public ManualExpectation() {
  }

  public ManualExpectation(final Integer score) {
    this.score = Objects.requireNonNullElse(score, 100);
  }

  public ManualExpectation(final Integer score, @NotBlank final String name, final String description) {
    this(score);
    this.name = name;
    this.description = description;
  }

  public ManualExpectation(final Integer score, @NotBlank final String name, final String description, final boolean expectationGroup) {
    this(score);
    this.name = name;
    this.description = description;
    this.expectationGroup = expectationGroup;
  }

  public static ManualExpectation manualExpectationForAsset(
          @Nullable final Integer score,
          @NotBlank final String name,
          final String description,
          @NotNull final Asset asset,
          final boolean expectationGroup
  ) {
    ManualExpectation manualExpectation = new ManualExpectation();
    manualExpectation.setScore(Objects.requireNonNullElse(score, 100));
    manualExpectation.setName(name);
    manualExpectation.setDescription(description);
    manualExpectation.setAsset(asset);
    manualExpectation.setExpectationGroup(expectationGroup);
    return manualExpectation;
  }

  public static ManualExpectation manualExpectationForAssetGroup(
          @Nullable final Integer score,
          @NotBlank final String name,
          final String description,
          @NotNull final AssetGroup assetGroup,
          final boolean expectationGroup
  ) {
    ManualExpectation manualExpectation = new ManualExpectation();
    manualExpectation.setScore(Objects.requireNonNullElse(score, 100));
    manualExpectation.setName(name);
    manualExpectation.setDescription(description);
    manualExpectation.setAssetGroup(assetGroup);
    manualExpectation.setExpectationGroup(expectationGroup);
    return manualExpectation;
  }

  @Override
  public EXPECTATION_TYPE type() {
    return EXPECTATION_TYPE.MANUAL;
  }

}
