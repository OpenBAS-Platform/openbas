package io.openbas.rest.injector.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

public class InjectorUpdateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("injector_name")
    private String name;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("injector_contracts")
    private String contracts;

    @JsonProperty("injector_state")
    private String state;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContracts() {
        return contracts;
    }

    public void setContracts(String contracts) {
        this.contracts = contracts;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
}
