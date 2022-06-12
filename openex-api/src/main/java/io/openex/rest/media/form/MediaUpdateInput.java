package io.openex.rest.media.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class MediaUpdateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("media_name")
    private String name;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("media_color")
    private String color;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
