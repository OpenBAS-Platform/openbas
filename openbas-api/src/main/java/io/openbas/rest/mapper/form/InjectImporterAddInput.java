package io.openbas.rest.mapper.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Data
public class InjectImporterAddInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("inject_importer_type_value")
    private String injectTypeValue;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("inject_importer_injector_contract")
    private String injectorContractId;

    @JsonProperty("inject_importer_rule_attributes")
    private List<RuleAttributeAddInput> ruleAttributes = new ArrayList<>();
}
