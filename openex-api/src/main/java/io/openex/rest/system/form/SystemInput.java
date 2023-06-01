package io.openex.rest.system.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class SystemInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("system_name")
    private String name;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("system_type")
    private String type;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("system_ip")
    private String ip;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("system_hostname")
    private String hostname;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("system_os")
    private String os;
}
