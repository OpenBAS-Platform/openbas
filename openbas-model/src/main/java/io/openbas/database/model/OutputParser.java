package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.helper.MonoIdDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

@Data
@Entity
@Table(name = "output_parser")
public class OutputParser implements Base {

  /**
   * OutputParser -> mode: stdout/sterr/fichier ->Enum -> type parsing : regex /xml -> Enum ->
   * Executor/Rule/Parser: Regex/ xPath -> String -> List<OutputContractElement> ->
   * ParserOutPutContract : group, name, key, contractoutputType
   */
  @Id
  @Column(name = "output_parser_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("output_parser_id")
  @NotBlank
  private String id;

  @Column(name = "output_parser_mode")
  @JsonProperty("output_parser_mode")
  private String mode;

  @Column(name = "output_parser_rule")
  @JsonProperty("output_parser_rule")
  private String rule;

  @Column(name = "output_parser_type")
  @JsonProperty("output_parser_type")
  private ParserType type;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "output_parser_mode")
  @JsonProperty("output_parser_mode")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @Schema(type = "string")
  List<OutputContractElement> outputContractElements = new ArrayList<>();
}
