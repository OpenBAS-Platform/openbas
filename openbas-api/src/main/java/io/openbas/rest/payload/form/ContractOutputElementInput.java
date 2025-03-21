package io.openbas.rest.payload.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.ContractOutputType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContractOutputElementInput {

  @JsonProperty("contract_output_element_rule")
  @Schema(description = "Parser Rule")
  private String rule;

  @JsonProperty("contract_output_element_name")
  @Schema(description = "Name")
  private String name;

  @JsonProperty("contract_output_element_key")
  @Schema(description = "Key")
  private String key;

  @JsonProperty("contract_output_element_type")
  @Schema(
      description =
          "Contract Output element type, can be: text, number, port, IPV6, IPV4, portscan, credentials")
  private ContractOutputType type;
}
