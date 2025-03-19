package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.helper.MonoIdDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

@Data
@Entity
@Table(name = "contract_output_elements")
public class ContractOutputElement implements Base {

  @Id
  @Column(name = "contract_output_element_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("contract_output_element_id")
  @NotBlank
  private String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JoinColumn(name = "contract_output_element_output_parser")
  @JsonProperty("contract_output_element_output_parser")
  @Schema(type = "string")
  private OutputParser outputParser;

  @Column(name = "contract_output_element_group")
  @JsonProperty("contract_output_element_group")
  private int group;

  @Column(name = "contract_output_element_name")
  @JsonProperty("contract_output_element_name")
  private String name;

  @Column(name = "contract_output_element_key")
  @JsonProperty("contract_output_element_key")
  private String key;

  @Column(name = "contract_output_element_type")
  @JsonProperty("contract_output_element_type")
  private ContractOutputType type;
}
