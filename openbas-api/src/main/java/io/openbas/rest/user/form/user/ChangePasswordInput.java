package io.openbas.rest.user.form.user;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

public class ChangePasswordInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("password")
    private String password;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("password_validation")
    private String passwordValidation;

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPasswordValidation() {
        return passwordValidation;
    }

    public void setPasswordValidation(String passwordValidation) {
        this.passwordValidation = passwordValidation;
    }
}
