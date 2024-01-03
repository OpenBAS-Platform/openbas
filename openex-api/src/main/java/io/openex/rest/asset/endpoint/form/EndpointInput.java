package io.openex.rest.asset.endpoint.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.rest.asset.form.AssetInput;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

@EqualsAndHashCode(callSuper = true)
@Data
public class EndpointInput extends AssetInput {


  @NotNull(message = MANDATORY_MESSAGE)
  @JsonProperty("endpoint_ips")
  private List<String> ips;

  @JsonProperty("endpoint_hostname")
  private String hostname;

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("endpoint_platform")
  private String platform;

  @JsonProperty("endpoint_last_seen")
  private Instant lastSeen;

  @JsonProperty("endpoint_mac_adresses")
  private List<String> macAdresses;

}
