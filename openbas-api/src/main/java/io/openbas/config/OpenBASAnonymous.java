package io.openbas.config;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;


public class OpenBASAnonymous implements OpenBASPrincipal {

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
