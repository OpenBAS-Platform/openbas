package io.openex.rest.audience.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class CreateAudienceInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("audience_name")
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
