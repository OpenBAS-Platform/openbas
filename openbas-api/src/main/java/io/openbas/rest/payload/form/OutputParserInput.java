package io.openbas.rest.payload.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.ParserMode;
import io.openbas.database.model.ParserType;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OutputParserInput {

  @JsonProperty("output_parser_mode")
  private ParserMode mode;

  @JsonProperty("output_parser_type")
  private ParserType type;

  @JsonProperty("output_parser_rule")
  private String rule;

  @JsonProperty("output_parser_contract_output_elements")
  private List<ContractOutputElementInput> contractOutputElements;
}
