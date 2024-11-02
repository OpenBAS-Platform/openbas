package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class InjectUpdateStatusInput {

  @JsonProperty("status")
  private String status;

  @JsonProperty("message")
  private String message;
}
