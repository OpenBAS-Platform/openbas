package io.openex.rest.media.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class MediaUpdateInput {
    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("media_type")
    private String type;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("media_name")
    private String name;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("media_description")
    private String description;

    @JsonProperty("media_mode")
    private String mode;

    @JsonProperty("media_primary_color_dark")
    private String primaryColorDark;

    @JsonProperty("media_primary_color_light")
    private String primaryColorLight;

    @JsonProperty("media_secondary_color_dark")
    private String secondaryColorDark;

    @JsonProperty("media_secondary_color_light")
    private String secondaryColorLight;

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

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPrimaryColorDark() {
        return primaryColorDark;
    }

    public void setPrimaryColorDark(String primaryColorDark) {
        this.primaryColorDark = primaryColorDark;
    }

    public String getPrimaryColorLight() {
        return primaryColorLight;
    }

    public void setPrimaryColorLight(String primaryColorLight) {
        this.primaryColorLight = primaryColorLight;
    }

    public String getSecondaryColorDark() {
        return secondaryColorDark;
    }

    public void setSecondaryColorDark(String secondaryColorDark) {
        this.secondaryColorDark = secondaryColorDark;
    }

    public String getSecondaryColorLight() {
        return secondaryColorLight;
    }

    public void setSecondaryColorLight(String secondaryColorLight) {
        this.secondaryColorLight = secondaryColorLight;
    }
}
