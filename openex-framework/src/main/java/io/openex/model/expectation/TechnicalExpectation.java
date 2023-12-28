package io.openex.model.expectation;

import io.openex.database.model.Asset;
import io.openex.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openex.model.Expectation;
import lombok.Getter;
import lombok.Setter;

import javax.annotation.Nullable;
import java.util.Objects;

import static io.openex.database.model.InjectExpectation.EXPECTATION_TYPE.TECHNICAL;

@Getter
@Setter
public class TechnicalExpectation implements Expectation {

  private Integer score;
  private Asset asset;
  private boolean expectationGroup;

  public TechnicalExpectation(
      @Nullable final Integer score,
      @Nullable final Asset asset,
      final boolean expectationGroup) {
    setScore(Objects.requireNonNullElse(score, 100));
    setAsset(asset);
    setExpectationGroup(expectationGroup);
  }

  @Override
  public EXPECTATION_TYPE type() {
    return TECHNICAL;
  }

}
