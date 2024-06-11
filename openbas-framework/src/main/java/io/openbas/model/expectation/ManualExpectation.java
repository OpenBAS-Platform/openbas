package io.openbas.model.expectation;

import io.openbas.model.Expectation;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.Objects;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;

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
  public EXPECTATION_TYPE type() {
    return EXPECTATION_TYPE.MANUAL;
  }

}
