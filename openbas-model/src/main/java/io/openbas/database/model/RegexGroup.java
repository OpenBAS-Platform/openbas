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
@Table(name = "regex_groups")
public class RegexGroup implements Base {

  @Id
  @Column(name = "regex_group_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("regex_group_id")
  @NotBlank
  private String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JoinColumn(name = "regex_group_contract_output_element_id")
  @JsonProperty("regex_group_contract_output_element")
  @Schema(type = "string")
  private ContractOutputElement contractOutputElement;

  @Column(name = "regex_group_field")
  @JsonProperty("regex_group_field")
  private String field;

  @Column(name = "regex_group_index")
  @JsonProperty("regex_group_index")
  private int index;
}
