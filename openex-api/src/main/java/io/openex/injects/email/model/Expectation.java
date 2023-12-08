package io.openex.injects.email.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.InjectExpectation;
import lombok.Data;

@Data
public class Expectation {

  @JsonProperty("expectation_type")
  private InjectExpectation.EXPECTATION_TYPE type;

  @JsonProperty("expectation_name")
  private String name;

  @JsonProperty("expectation_description")
  private String description;

  @JsonProperty("expectation_score")
  private Integer score;

}
