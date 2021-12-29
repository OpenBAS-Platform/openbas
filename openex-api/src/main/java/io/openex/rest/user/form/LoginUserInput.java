package io.openex.rest.user.form;

import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class LoginUserInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    private String login;

    @NotBlank(message = MANDATORY_MESSAGE)
    private String password;

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
