package io.openbas.rest.injector_contract.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Endpoint.PLATFORM_TYPE;
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

    @Getter
    @JsonProperty("contract_manual")
    private boolean manual = false;

    @Getter
    @JsonProperty("contract_labels")
    private Map<String, String> labels;

    @Getter
    @JsonProperty("contract_attack_patterns_external_ids")
    private List<String> attackPatternsExternalIds = new ArrayList<>();

    @Getter
    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("contract_content")
    private String content;

    @JsonProperty("is_atomic_testing")
    private boolean isAtomicTesting = true;

    @Getter
    @JsonProperty("contract_platforms")
    private PLATFORM_TYPE[] platforms = new PLATFORM_TYPE[0];

    public void setId(String id) {
        this.id = id;
    }

    public void setManual(boolean manual) {
        this.manual = manual;
    }

    public void setLabels(Map<String, String> labels) {
        this.labels = labels;
    }

    public void setAttackPatternsExternalIds(List<String> attackPatternsExternalIds) {
        this.attackPatternsExternalIds = attackPatternsExternalIds;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isAtomicTesting() {
        return isAtomicTesting;
    }

    public void setAtomicTesting(boolean atomicTesting) {
        isAtomicTesting = atomicTesting;
    }

    public void setPlatforms(PLATFORM_TYPE[] platforms) {
        this.platforms = platforms;
    }
}
