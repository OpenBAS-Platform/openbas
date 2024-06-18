package io.openbas.rest.mapper.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class RuleAttributeInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("rule_attribute_name")
    private String name;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("rule_attribute_columns")
    private String columns;

    @JsonProperty("rule_attribute_default_value")
    private String defaultValue;

}
