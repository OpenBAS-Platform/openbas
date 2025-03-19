package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import org.hibernate.annotations.Type;

@Data
public class OutputParser {

  @NotBlank
  @JsonProperty("output_parser_mode")
  private ParserMode mode;

  @NotBlank
  @JsonProperty("output_parser_type")
  private ParserType type;

  @NotBlank
  @JsonProperty("output_parser_rule")
  private String rule;

  @Type(JsonType.class)
  @JsonProperty("output_parser_contract_output_elements")
  List<ContractOutputElement> contractOutputElements = new ArrayList<>();
}
