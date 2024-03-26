package io.openbas.rest.injector.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class InjectorContractInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("contract_id")
    private String id;

    @JsonProperty("contract_manual")
    private boolean manual = false;

    @JsonProperty("contract_labels")
    private Map<String, String> labels;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("contract_content")
    private String content;
}
