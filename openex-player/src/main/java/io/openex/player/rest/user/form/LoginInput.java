package io.openex.player.rest.user.form;

import javax.validation.constraints.NotBlank;

public class LoginInput {

    @NotBlank(message = "This value should not be blank.")
    private String login;

    @NotBlank(message = "This value should not be blank.")
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
