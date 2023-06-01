package io.openex.rest.zone.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class ZoneInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("zone_name")
    private String name;

    @JsonProperty("zone_description")
    private String description;
}
