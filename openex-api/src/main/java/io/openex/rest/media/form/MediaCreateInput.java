package io.openex.rest.media.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class MediaCreateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("media_type")
    private String type;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("media_name")
    private String name;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("media_description")
    private String description;

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
