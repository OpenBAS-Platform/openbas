package io.openbas.rest.payload.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class PayloadFindInput {

  @NotNull(message = MANDATORY_MESSAGE)
  @JsonProperty("payload_version")
  private Integer version;

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("payload_external_id")
  private String externalId;

}
