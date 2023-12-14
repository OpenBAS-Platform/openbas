package io.openex.rest.user.form.user;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class UpdatePasswordInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("user_plain_password")
    private String password;

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
