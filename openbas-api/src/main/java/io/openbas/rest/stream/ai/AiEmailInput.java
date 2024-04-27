package io.openbas.rest.stream.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class AiEmailInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("ai_context")
    private String context;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("ai_description")
    private String description;

    @JsonProperty("ai_tone")
    private String tone = "natural";

    @JsonProperty("ai_sender")
    private String sender;

    @JsonProperty("ai_recipient")
    private String recipient;
}
