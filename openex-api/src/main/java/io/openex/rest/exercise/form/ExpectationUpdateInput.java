
package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotNull;

@Getter
@Setter
public class ExpectationUpdateInput {

  @JsonProperty("expectation_score")
  @NotNull
  private Integer score;

}
