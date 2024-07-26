package io.openbas.rest.injector_contract.output;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Endpoint.PLATFORM_TYPE;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.*;

@Data
public class InjectorContractOutput {

  @JsonProperty("injector_contract_id")
  @NotBlank
  private String id;

  @JsonProperty("injector_contract_labels")
  private Map<String, String> labels;

  @JsonProperty("injector_contract_content")
  @NotBlank
  private String content;

  @JsonProperty("injector_contract_platforms")
  private PLATFORM_TYPE[] platforms;

  @JsonProperty("injector_contract_payload_type")
  private String payloadType;

  @JsonProperty("injector_contract_injector_type")
  private String injectorType;

  @JsonProperty("injector_contract_attack_patterns")
  private List<String> attackPatterns;

  public InjectorContractOutput(
      String id,
      Map<String, String> labels,
      String content,
      PLATFORM_TYPE[] platforms,
      String payloadType,
      String collectorType,
      String injectorType,
      String[] attackPatterns) {
    this.id = id;
    this.labels = labels;
    this.content = content;
    this.platforms = platforms;
    this.payloadType = Optional.ofNullable(collectorType).orElse(payloadType);
    this.injectorType = injectorType;

    this.attackPatterns = attackPatterns != null ? new ArrayList<>(Arrays.asList(attackPatterns)) : new ArrayList<>();
  }
}
