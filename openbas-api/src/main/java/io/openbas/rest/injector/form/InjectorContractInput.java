package io.openbas.rest.injector.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
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

    @JsonProperty("contract_attack_patterns")
    private List<String> attackPatterns = new ArrayList<>();

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("contract_content")
    private String content;

    @JsonProperty("is_atomic_testing")
    private boolean isAtomicTesting = true;
}
