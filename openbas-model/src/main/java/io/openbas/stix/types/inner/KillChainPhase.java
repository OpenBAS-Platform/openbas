package io.openbas.stix.types.inner;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KillChainPhase {
  @JsonProperty("kill_chain_name")
  private String killChainName;

  @JsonProperty("phase_name")
  private String phaseName;

  @JsonProperty("x_opencti_order")
  private Integer xOpenCtiOrder;
}
