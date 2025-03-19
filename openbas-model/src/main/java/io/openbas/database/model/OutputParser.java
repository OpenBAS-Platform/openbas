package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UuidGenerator;

@Data
@Entity
@Table(name = "output_parsers")
public class OutputParser implements Base {

  @Id
  @Column(name = "output_parser_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("output_parser_id")
  @NotBlank
  private String id;

  @Column(name = "output_parser_mode")
  @JsonProperty("output_parser_mode")
  private ParserMode mode;

  @Column(name = "output_parser_type")
  @JsonProperty("output_parser_type")
  private ParserType type;

  @Column(name = "output_parser_rule")
  @JsonProperty("output_parser_rule")
  private String rule;

  @Type(JsonType.class)
  @Column(name = "output_parser_contract_output_elements")
  @JsonProperty("output_parser_contract_output_elements")
  List<ContractOutputElement> contractOutputElements = new ArrayList<>();
}
