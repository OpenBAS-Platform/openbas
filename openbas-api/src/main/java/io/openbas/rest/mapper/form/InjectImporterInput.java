package io.openbas.rest.mapper.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class InjectImporterInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("inject_importer_name")
    private String name;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("inject_importer_type_value")
    private String injectTypeValue;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("inject_importer_injector_contract_id")
    private String injectorContractId;

    @JsonProperty("inject_importer_rule_attributes")
    private List<RuleAttributeInput> ruleAttributes;
}