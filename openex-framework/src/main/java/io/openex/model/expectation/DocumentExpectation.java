package io.openex.model.expectation;

import io.openex.database.model.InjectExpectation;
import io.openex.model.Expectation;
import lombok.Getter;
import lombok.Setter;

import java.util.Objects;

@Getter
@Setter
public class DocumentExpectation implements Expectation {

  private Integer score;

  public DocumentExpectation(Integer score) {
    setScore(Objects.requireNonNullElse(score, 100));
  }

  @Override
  public InjectExpectation.EXPECTATION_TYPE type() {
    return InjectExpectation.EXPECTATION_TYPE.DOCUMENT;
  }

}
