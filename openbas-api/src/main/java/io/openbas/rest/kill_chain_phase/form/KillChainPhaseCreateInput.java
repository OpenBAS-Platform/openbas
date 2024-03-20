package io.openbas.rest.kill_chain_phase.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

public class KillChainPhaseCreateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("phase_kill_chain_name")
    private String killChainName;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("phase_name")
    private String name;

    @JsonProperty("phase_stix_id")
    private String stixId;

    @JsonProperty("phase_external_id")
    private String externalId;

    @JsonProperty("phase_short_name")
    private String shortName;

    @JsonProperty("phase_description")
    private String description;

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

    public String getStixId() {
        return stixId;
    }

    public void setStixId(String stixId) {
        this.stixId = stixId;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getOrder() {
        return order;
    }

    public void setOrder(Long order) {
        this.order = order;
    }
}
