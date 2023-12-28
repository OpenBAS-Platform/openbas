package io.openex.rest.asset.endpoint.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.rest.asset.form.AssetInput;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

@EqualsAndHashCode(callSuper = true)
@Data
public class EndpointInput extends AssetInput {


  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("endpoint_ip")
  private String ip;

  @JsonProperty("endpoint_hostname")
  private String hostname;

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("endpoint_os")
  private String os;

}
