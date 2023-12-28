package io.openex.config;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public interface OpenExPrincipal {

  String getId();

  Collection<? extends GrantedAuthority> getAuthorities();

  boolean isAdmin();
}
