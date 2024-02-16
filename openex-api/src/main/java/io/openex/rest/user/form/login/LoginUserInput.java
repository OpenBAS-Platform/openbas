package io.openex.rest.user.form.login;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginUserInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    private String login;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty
    private String password;

}
