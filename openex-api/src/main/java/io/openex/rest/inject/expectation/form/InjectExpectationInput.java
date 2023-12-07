package io.openex.rest.inject.expectation.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.InjectExpectation;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class InjectExpectationInput {

  @NotNull
  @JsonProperty("inject_expectation_type")
  private InjectExpectation.EXPECTATION_TYPE type;

  @NotBlank
  @JsonProperty("inject_expectation_name")
  private String name;

  @JsonProperty("inject_expectation_description")
  private String description;

  @NotNull
  @JsonProperty("inject_expectation_expected_score")
  private Integer expectedScore;

}
