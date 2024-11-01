package io.openbas.rest.challenge.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ChallengeTryInput {

  @JsonProperty("challenge_value")
  private String value;

  public String getValue() {
    return value;
  }

  public void setValue(String value) {
    this.value = value;
  }
}
