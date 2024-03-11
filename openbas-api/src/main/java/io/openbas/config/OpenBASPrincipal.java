package io.openbas.config;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public interface OpenBASPrincipal {

  String getId();

  Collection<? extends GrantedAuthority> getAuthorities();

  boolean isAdmin();

  String getLang();
}
