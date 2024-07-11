package io.openbas.rest.mapper.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Data
public class RuleAttributeUpdateInput {

    @JsonProperty("rule_attribute_id")
    private String id;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("rule_attribute_name")
    private String name;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("rule_attribute_columns")
    private String columns;

    @JsonProperty("rule_attribute_default_value")
    private String defaultValue;

    @JsonProperty("rule_attribute_additional_config")
    private Map<String, String> additionalConfig;

}
