package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.converter.ContentConverter;
import io.openbas.database.model.Endpoint;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Convert;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class InjectorContractSimple {

  @Schema(description = "Id")
  @JsonProperty("injector_contract_id")
  @NotNull
  private String id;

  @Schema(description = "Content")
  @JsonProperty("injector_contract_content")
  @NotBlank
  private String content;

  @JsonProperty("convertedContent")
  @Convert(converter = ContentConverter.class)
  private ObjectNode convertedContent;

  @JsonProperty("injector_contract_platforms")
  private Endpoint.PLATFORM_TYPE[] platforms;

  @Schema(description = "Payload Collector type")
  @JsonProperty("payload_collector_type")
  @NotBlank
  private String payloadCollectorType;

  @Schema(description = "Payload type")
  @JsonProperty("payload_type")
  @NotBlank
  private String payloadType;

  @Schema(description = "Contract labels")
  @JsonProperty("injector_contract_labels")
  @NotBlank
  private Map<String, String> labels = new HashMap<>();
}
