package io.openbas.rest.injector.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.rest.injector_contract.form.InjectorContractInput;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

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

    @JsonProperty("injector_contracts")
    private List<InjectorContractInput> contracts;

    @JsonProperty("injector_custom_contracts")
    private Boolean customContracts = false;

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

    public List<InjectorContractInput> getContracts() {
        return contracts;
    }

    public void setContracts(List<InjectorContractInput> contracts) {
        this.contracts = contracts;
    }

    public Boolean getCustomContracts() {
        return customContracts;
    }

    public void setCustomContracts(Boolean customContracts) {
        this.customContracts = customContracts;
    }
}
