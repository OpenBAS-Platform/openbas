package io.openbas.rest.kill_chain_phase.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import jakarta.validation.constraints.NotBlank;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Getter
public class KillChainPhaseCreateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("phase_name")
    private String name;

    @JsonProperty("phase_kill_chain_name")
    private String killChainName;

    @JsonProperty("phase_order")
    private Long order;

    public void setName(String name) {
        this.name = name;
    }

    public void setKillChainName(String killChainName) {
        this.killChainName = killChainName;
    }

    public void setOrder(Long order) {
        this.order = order;
    }
}
