package io.openbas.rest.payload.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.ContractOutputType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
public class ContractOutputElementInput {

  @JsonProperty("contract_output_element_is_finding")
  @Schema(
      description =
          "Indicates whether this contract output element can be used to generate a finding")
  private boolean isFinding;

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

  @JsonProperty("contract_output_element_tags")
  @Schema(description = "List of tags")
  private List<String> tagIds = new ArrayList<>();

  @JsonProperty("contract_output_element_regex_groups")
  @Schema(description = "Set of regex groups")
  private Set<RegexGroupInput> regexGroups = new HashSet<>();
}
