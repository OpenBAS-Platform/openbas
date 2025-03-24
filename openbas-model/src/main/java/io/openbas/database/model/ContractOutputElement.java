package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.helper.MonoIdDeserializer;
import io.openbas.helper.MultiIdSetDeserializer;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.HashSet;
import java.util.Set;
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
  @JoinColumn(name = "contract_output_element_output_parser_id")
  @JsonProperty("contract_output_element_output_parser")
  @Schema(type = "string")
  private OutputParser outputParser;

  @Column(name = "contract_output_element_is_finding")
  @JsonProperty("contract_output_element_is_finding")
  private boolean isFinding;

  @Column(name = "contract_output_element_rule")
  @JsonProperty("contract_output_element_rule")
  private String rule;

  @OneToMany(mappedBy = "contractOutputElement", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
  @JsonProperty("contract_output_element_regex_groups")
  private Set<RegexGroup> regexGroups = new HashSet<>();

  @Column(name = "contract_output_element_key")
  @JsonProperty("contract_output_element_key")
  private String key;

  @Enumerated(EnumType.STRING)
  @Column(name = "contract_output_element_type")
  @JsonProperty("contract_output_element_type")
  private ContractOutputType type;

  @ArraySchema(schema = @Schema(type = "string"))
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "contract_output_elements_tags",
      joinColumns = @JoinColumn(name = "contract_output_element_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id"))
  @JsonSerialize(using = MultiIdSetDeserializer.class)
  @JsonProperty("contract_output_element_tags")
  private Set<Tag> tags = new HashSet<>();
}
