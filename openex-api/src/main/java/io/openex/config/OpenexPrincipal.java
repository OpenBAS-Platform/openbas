package io.openex.config;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public interface OpenexPrincipal {

  public abstract String getId();

  public abstract Collection<? extends GrantedAuthority> getAuthorities();

  public abstract boolean isAdmin();
}
