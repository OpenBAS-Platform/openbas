package io.openbas.rest.stream.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class AiInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("prompt_type")
    private String type;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("prompt_question")
    private String question;
}
