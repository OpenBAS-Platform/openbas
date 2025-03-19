package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

@Data
@Entity
@Table(name = "output_contract_element")
public class OutputContractElement implements Base {

  @Id
  @Column(name = "output_contract_element_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("output_contract_element_id")
  @NotBlank
  private String id;

  @Column(name = "output_contract_element_group")
  @JsonProperty("output_contract_element_group")
  private int group;

  @Column(name = "output_contract_element_name")
  @JsonProperty("output_contract_element_name")
  private String name;

  @Column(name = "output_contract_element_key")
  @JsonProperty("output_contract_element_key")
  private String key;

  @Column(name = "output_contract_element_type")
  @JsonProperty("output_contract_element_type")
  private ContractOutputType type;
}
