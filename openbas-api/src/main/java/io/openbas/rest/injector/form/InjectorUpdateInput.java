package io.openbas.rest.injector.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.rest.injector_contract.form.InjectorContractInput;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class InjectorUpdateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("injector_name")
    private String name;

    @JsonProperty("injector_contracts")
    private List<InjectorContractInput> contracts;

    @JsonProperty("injector_custom_contracts")
    private Boolean customContracts = false;

    @JsonProperty("injector_category")
    private String category;

    @JsonProperty("injector_executor_commands")
    private Map<String, String> executorCommands;

    @JsonProperty("injector_executor_clear_commands")
    private Map<String, String> executorClearCommands;

    @JsonProperty("injector_payloads")
    private Boolean payloads = false;
}
