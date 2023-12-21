package io.openex.model.expectation;

import io.openex.database.model.InjectExpectation;
import io.openex.model.Expectation;
import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import java.util.Objects;

@Getter
@Setter
public class ManualExpectation implements Expectation {

  private Integer score;
  private String name;
  private String description;

  public ManualExpectation(final Integer score) {
    this.score = Objects.requireNonNullElse(score, 100);
  }

  public ManualExpectation(final Integer score, @NotBlank final String name, final String description) {
    this(score);
    this.name = name;
    this.description = description;
  }

  @Override
  public InjectExpectation.EXPECTATION_TYPE type() {
    return InjectExpectation.EXPECTATION_TYPE.MANUAL;
  }

}
