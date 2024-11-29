package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.converter.ContentConverter;
import io.openbas.database.model.Endpoint;
import jakarta.persistence.Convert;
import jakarta.validation.constraints.NotBlank;
import java.util.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class AtomicInjectorContractOutput {

  @JsonProperty("injector_contract_id")
  @NotBlank
  private String id;

  @JsonProperty("injector_contract_content")
  @NotBlank
  private String content;

  @JsonProperty("convertedContent")
  @Convert(converter = ContentConverter.class)
  private ObjectNode convertedContent;

  @JsonProperty("injector_contract_platforms")
  private Endpoint.PLATFORM_TYPE[] platforms;

  @Builder.Default
  @JsonProperty("injector_contract_labels")
  @NotBlank
  private Map<String, String> labels = new HashMap<>();
}
