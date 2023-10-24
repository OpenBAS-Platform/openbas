package io.openex.config;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;


public class OpenExAnonymous extends OpenexPrincipal {

  public final static String ANONYMOUS = "anonymous";

  @Override
  public String getId() {
    return ANONYMOUS;
  }

  @Override
  public boolean isAdmin() {
    return false;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return null;
  }
}
