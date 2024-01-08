package io.openex.rest.kill_chain_phase.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

@Getter
public class KillChainPhaseCreateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("phase_name")
    private String name;

    @JsonProperty("phase_kill_chain_name")
    private String killChainName;

    @JsonProperty("phase_order")
    private Long order;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getKillChainName() {
        return killChainName;
    }

    public void setKillChainName(String killChainName) {
        this.killChainName = killChainName;
    }

    public Long getOrder() {
        return order;
    }

    public void setOrder(Long order) {
        this.order = order;
    }
}