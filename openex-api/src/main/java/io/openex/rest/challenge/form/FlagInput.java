package io.openex.rest.challenge.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class FlagInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("flag_type")
    private String type;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("flag_value")
    private String value;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
