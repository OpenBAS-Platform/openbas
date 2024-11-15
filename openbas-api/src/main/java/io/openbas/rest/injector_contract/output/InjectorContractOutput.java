package io.openbas.rest.injector_contract.output;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Endpoint.PLATFORM_TYPE;
import io.openbas.rest.atomic_testing.form.PayloadOutput;
import jakarta.validation.constraints.NotBlank;
import java.util.*;
import lombok.Data;

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
  private PayloadOutput payload;

  @JsonProperty("injector_contract_injector_type")
  private String injectorType;

  @JsonProperty("injector_contract_attack_patterns")
  private List<String> attackPatterns;

  @JsonProperty("injector_contract_arch")
  private Endpoint.PLATFORM_ARCH arch;

  public InjectorContractOutput(
      String id,
      Map<String, String> labels,
      String content,
      PLATFORM_TYPE[] platforms,
      PayloadOutput payload,
      String collectorType,
      String injectorType,
      String[] attackPatterns,
      Endpoint.PLATFORM_ARCH arch) {
    this.id = id;
    this.labels = labels;
    this.co
    this.content = content;
    this.platforms = platforms;
    this.payload = payload;
    this.injectorType = injectorType;

    this.attackPatterns =
        attackPatterns != null ? new ArrayList<>(Arrays.asList(attackPatterns)) : new ArrayList<>();
    this.arch = arch;
  }
}
