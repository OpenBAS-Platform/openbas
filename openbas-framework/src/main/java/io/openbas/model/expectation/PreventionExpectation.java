package io.openbas.model.expectation;

import io.openbas.database.model.Asset;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.database.model.InjectExpectationSignature;
import io.openbas.model.Expectation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import javax.annotation.Nullable;
import java.util.List;
import java.util.Objects;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.PREVENTION;

@Getter
@Setter
public class PreventionExpectation implements Expectation {

  private Double score;
  private String name;
  private String description;
  private Asset asset;
  private AssetGroup assetGroup;
  private boolean expectationGroup;
  private Long expirationTime;
  private List<InjectExpectationSignature> injectExpectationSignatures;

  private PreventionExpectation() {
  }

  @Override
  public EXPECTATION_TYPE type() {
    return PREVENTION;
  }

  public static PreventionExpectation preventionExpectationForAsset(
      @Nullable final Double score,
      @NotBlank final String name,
      final String description,
      @NotNull final Asset asset,
      final boolean expectationGroup,
      final Long expirationTime,
      final List<InjectExpectationSignature> expectationSignatures
  ) {
    PreventionExpectation preventionExpectation = new PreventionExpectation();
    preventionExpectation.setScore(Objects.requireNonNullElse(score, 100.0));
    preventionExpectation.setName(name);
    preventionExpectation.setDescription(description);
    preventionExpectation.setAsset(asset);
    preventionExpectation.setExpectationGroup(expectationGroup);
    preventionExpectation.setExpirationTime(expirationTime);
    preventionExpectation.setInjectExpectationSignatures(expectationSignatures);
    return preventionExpectation;
  }

  public static PreventionExpectation preventionExpectationForAssetGroup(
      @Nullable final Double score,
      @NotBlank final String name,
      final String description,
      @NotNull final AssetGroup assetGroup,
      final boolean expectationGroup,
      @NotNull final Long expirationTime,
      final List<InjectExpectationSignature> expectationSignatures
  ) {
    PreventionExpectation preventionExpectation = new PreventionExpectation();
    preventionExpectation.setScore(Objects.requireNonNullElse(score, 100.0));
    preventionExpectation.setName(name);
    preventionExpectation.setDescription(description);
    preventionExpectation.setAssetGroup(assetGroup);
    preventionExpectation.setExpectationGroup(expectationGroup);
    preventionExpectation.setExpirationTime(expirationTime);
    preventionExpectation.setInjectExpectationSignatures(expectationSignatures);
    return preventionExpectation;
  }

}
