package io.openex.rest.user.form.me;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.EMAIL_FORMAT;
import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class UpdateProfileInput {

    @Email(message = EMAIL_FORMAT)
    @JsonProperty("user_email")
    private String email;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("user_firstname")
    private String firstname;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("user_lastname")
    private String lastname;

    @JsonProperty("user_organization")
    private String organizationId;

    @JsonProperty("user_lang")
    private String lang;

    @JsonProperty("user_theme")
    private String theme;

    @JsonProperty("user_country")
    private String country;

}
