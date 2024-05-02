package io.openbas.rest.settings.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Setter
@Getter
public class SettingsPlatformWhitemarkUpdateInput {
    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("platform_whitemark")
    private String platformWhitemark;
}
