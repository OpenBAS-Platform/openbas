package io.openex.config;

import org.springframework.security.core.context.SecurityContextHolder;

public class SessionHelper {

  public final static String ANONYMOUS_USER = "anonymousUser";

  public static OpenExPrincipal currentUser() {
    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    if (ANONYMOUS_USER.equals(principal)) {
      return new OpenExAnonymous();
    }
    return (OpenExPrincipal) principal;
  }
}
