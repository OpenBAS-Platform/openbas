package io.openex.rest.utils.fixtures;

import io.openex.rest.user.form.login.LoginUserInput;

public class UserFixture {

    public static final String PASSWORD = "myPwd24!@";
    public static final String EMAIL = "user@filigran.io";

    public static LoginUserInput.LoginUserInputBuilder getDefault() {
        return LoginUserInput.builder();
    }

    public static LoginUserInput.LoginUserInputBuilder getDefaultWithPwd() {
        return LoginUserInput.builder().password(PASSWORD);
    }

    public static LoginUserInput getLoginUserInput() {
        return LoginUserInput.builder().login(EMAIL).password(PASSWORD).build();
    }

}
