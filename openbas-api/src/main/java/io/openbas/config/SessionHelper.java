package io.openbas.config;

import org.springframework.security.core.context.SecurityContextHolder;

public class SessionHelper {

  private SessionHelper() {}

  public static final String ANONYMOUS_USER = "anonymousUser";

  public static OpenBASPrincipal currentUser() {
    if (SecurityContextHolder.getContext().getAuthentication() == null) {
      return new OpenBASAnonymous();
    }
    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    if (ANONYMOUS_USER.equals(principal)) {
      return new OpenBASAnonymous();
    }
    return (OpenBASPrincipal) principal;
  }
}
