package io.openbas.rest.settings.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

public class SettingsUpdateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("platform_name")
    private String name;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("platform_theme")
    private String theme;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("platform_lang")
    private String lang;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getLang() {
        return lang;
    }

    public void setLang(String lang) {
        this.lang = lang;
    }
}
