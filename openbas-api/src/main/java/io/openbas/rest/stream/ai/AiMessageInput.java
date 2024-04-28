package io.openbas.rest.stream.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class AiMessageInput {
    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("ai_input")
    private String input;

    @JsonProperty("ai_paragraphs")
    private Integer paragraphs;

    @JsonProperty("ai_context")
    private String context = "No context";

    @JsonProperty("ai_tone")
    private String tone = "natural";

    @JsonProperty("ai_sender")
    private String sender;

    @JsonProperty("ai_recipient")
    private String recipient;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("ai_format")
    private String format;
}
