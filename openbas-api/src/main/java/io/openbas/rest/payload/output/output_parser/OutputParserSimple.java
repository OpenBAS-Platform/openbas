package io.openbas.rest.payload.output.output_parser;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.ParserMode;
import io.openbas.database.model.ParserType;
import java.util.Set;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Represents a single output parser")
public class OutputParserSimple {

  @JsonProperty("output_parser_id")
  private String id;

  @JsonProperty("output_parser_mode")
  @Schema(
          description = "Mode of parser, which output will be parsed, for now only STDOUT is supported")
  private ParserMode mode;

  @JsonProperty("output_parser_type")
  @Schema(
          description = "Type of parser, for now only REGEX is supported")
  private ParserType type;

  @JsonProperty("output_parser_contract_output_elements")
  private Set<ContractOutputElementSimple> contractOutputElement;
}
