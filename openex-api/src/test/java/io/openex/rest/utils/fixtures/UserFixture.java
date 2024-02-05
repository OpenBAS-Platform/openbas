package io.openex.rest.utils.fixtures;

import io.openex.rest.user.form.login.LoginUserInput;

public class UserFixture {

    public static LoginUserInput.LoginUserInputBuilder getDefault() {
        return LoginUserInput.builder();
    }

    public static LoginUserInput getLoginUserInput() {
        return LoginUserInput.builder().login("user@filigran.io").password("myPwd24!@").build();
    }

}
