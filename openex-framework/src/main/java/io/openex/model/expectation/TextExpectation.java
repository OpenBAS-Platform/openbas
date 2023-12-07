package io.openex.model.expectation;

import io.openex.database.model.InjectExpectation;
import io.openex.model.Expectation;
import lombok.Getter;
import lombok.Setter;

import java.util.Objects;

@Getter
@Setter
public class TextExpectation implements Expectation { // TODO: unused

  private Integer score;

  public TextExpectation(Integer score) {
    setScore(Objects.requireNonNullElse(score, 100));
  }

  @Override
  public InjectExpectation.EXPECTATION_TYPE type() {
    return InjectExpectation.EXPECTATION_TYPE.TEXT;
  }

}
