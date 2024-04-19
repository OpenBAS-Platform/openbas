package io.openbas.rest.kill_chain_phase.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

public class KillChainPhaseUpdateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("phase_kill_chain_name")
    private String killChainName;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("phase_name")
    private String name;

    @JsonProperty("phase_order")
    private Long order;

    public String getKillChainName() {
        return killChainName;
    }

    public void setKillChainName(String killChainName) {
        this.killChainName = killChainName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    public Long getOrder() {
        return order;
    }

    public void setOrder(Long order) {
        this.order = order;
    }
}
