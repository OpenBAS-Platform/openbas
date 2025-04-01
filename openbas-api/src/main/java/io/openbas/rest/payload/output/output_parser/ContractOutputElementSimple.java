package io.openbas.rest.payload.output.output_parser;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.ContractOutputType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.Set;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Represents the rules for parsing the output of an execution.")
public class ContractOutputElementSimple {

  @JsonProperty("contract_output_element_id")
  private String id;

  @JsonProperty("contract_output_element_rule")
  @Schema(description = "The rule to apply for parsing the output, for example, can be a regex.")
  private String rule;

  @JsonProperty("contract_output_element_name")
  @Schema(description = "Represents the name of the rule.")
  private String name;

  @JsonProperty("contract_output_element_key")
  @Schema(description = "Represents a unique key identifier.")
  private String key;

  @JsonProperty("contract_output_element_type")
  @Schema(
      description = "Represents the data type being extracted.",
      example = "text, number, port, portscan, ipv4, ipv6, credentials")
  private ContractOutputType type;

  @JsonProperty("contract_output_element_tags")
  private List<String> tagIds;

  @JsonProperty("contract_output_element_regex_groups")
  private Set<RegexGroupSimple> regexGroups;
}
