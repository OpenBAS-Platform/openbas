package io.openex.helper;

import io.openex.database.model.User;
import org.springframework.security.core.context.SecurityContextHolder;

public class UserHelper {

    public final static String ANONYMOUS = "anonymous";
    private final static String ANONYMOUS_USER = "anonymousUser";

    public static User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (ANONYMOUS_USER.equals(principal)) {
            User anonymousUser = new User();
            anonymousUser.setId(ANONYMOUS);
            anonymousUser.setEmail("anonymous@openex.io");
            return anonymousUser;
        }
        assert principal instanceof User;
        return (User) principal;
    }
}
