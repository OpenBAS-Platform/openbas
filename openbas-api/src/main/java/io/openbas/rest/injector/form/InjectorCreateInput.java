package io.openbas.rest.injector.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

public class InjectorCreateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("injector_id")
    private String id;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("injector_name")
    private String name;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("injector_type")
    private String type;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("injector_contracts")
    private String contracts;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

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
}
