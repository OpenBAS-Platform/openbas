package io.openbas.rest.payload.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.ContractOutputType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContractOutputElementInput {

  @JsonProperty("contract_output_element_group")
  private int group;

  @JsonProperty("contract_output_element_name")
  private String name;

  @JsonProperty("contract_output_element_key")
  private String key;

  @JsonProperty("contract_output_element_type")
  private ContractOutputType type;
}
