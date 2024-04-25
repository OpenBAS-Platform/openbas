package io.openbas.rest.payload.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class PayloadUpdateInput {
    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("payload_type")
    private String type;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("payload_name")
    private String name;

    @JsonProperty("payload_description")
    private String description;

    @JsonProperty("payload_tags")
    private List<String> tagIds = new ArrayList<>();

}


