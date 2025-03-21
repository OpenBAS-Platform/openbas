package io.openbas.rest.payload.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.ParserMode;
import io.openbas.database.model.ParserType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OutputParserInput {

  @JsonProperty("output_parser_mode")
  @Schema(description = "Paser Mode: STDOUT, STDERR, READ_FILE")
  private ParserMode mode;

  @JsonProperty("output_parser_type")
  @Schema(description = "Parser Type: REGEX")
  private ParserType type;

  @JsonProperty("output_parser_contract_output_elements")
  @Schema(description = "List of Contract output elements")
  private List<ContractOutputElementInput> contractOutputElements;
}
