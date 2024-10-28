package io.openbas.rest.challenge.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ChallengeResult {
  @JsonProperty("result")
  private Boolean result;

  public ChallengeResult(Boolean result) {
    this.result = result;
  }
}
