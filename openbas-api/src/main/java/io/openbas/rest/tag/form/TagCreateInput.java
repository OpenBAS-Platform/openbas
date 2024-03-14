package io.openbas.rest.tag.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Setter
@Getter
public class TagCreateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("tag_name")
    private String name;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("tag_color")
    private String color;

}
