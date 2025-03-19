package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.helper.MonoIdDeserializer;
import io.openbas.helper.MultiModelDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
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

  @ManyToOne(fetch = FetchType.LAZY)
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JoinColumn(name = "output_parser_payload")
  @JsonProperty("output_parser_payload")
  @Schema(type = "string")
  private Payload payload;

  @Column(name = "output_parser_mode")
  @JsonProperty("output_parser_mode")
  private ParserMode mode;

  @Column(name = "output_parser_type")
  @JsonProperty("output_parser_type")
  private ParserType type;

  @Column(name = "output_parser_rule")
  @JsonProperty("output_parser_rule")
  private String rule;

  @OneToMany(mappedBy = "output_parser", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
  @JsonProperty("output_parser_contract_output_elements")
  @JsonSerialize(using = MultiModelDeserializer.class)
  List<ContractOutputElement> contractOutputElements = new ArrayList<>();
}
