package io.openex.config;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public interface OpenexPrincipal {

  String getId();

  Collection<? extends GrantedAuthority> getAuthorities();

  boolean isAdmin();

  String getLang();
}
