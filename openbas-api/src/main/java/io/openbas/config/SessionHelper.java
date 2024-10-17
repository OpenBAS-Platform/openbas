package io.openbas.config;

import org.springframework.security.core.context.SecurityContextHolder;

public class SessionHelper {

  public static final String ANONYMOUS_USER = "anonymousUser";

  public static OpenBASPrincipal currentUser() {
    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    if (ANONYMOUS_USER.equals(principal)) {
      return new OpenBASAnonymous();
    }
    return (OpenBASPrincipal) principal;
  }
}
