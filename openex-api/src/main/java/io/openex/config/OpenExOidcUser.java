package io.openex.config;

import io.openex.database.model.User;
import org.jetbrains.annotations.NotNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.*;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.database.model.User.ROLE_USER;

public class OpenExOidcUser implements OpenexPrincipal, OidcUser {

  private final User user;

  public OpenExOidcUser(@NotNull final User user) {
    this.user = user;
  }

  @Override
  public String getId() {
    return user.getId();
  }

  @Override
  public boolean isAdmin() {
    return user.isAdmin();
  }

  @Override
  public Map<String, Object> getClaims() {
    return getAttributes();
  }

  @Override
  public OidcUserInfo getUserInfo() {
    return OidcUserInfo.builder().name(getName()).email(getEmail()).build();
  }

  @Override
  public OidcIdToken getIdToken() {
    return null;
  }

  @Override
  public Map<String, Object> getAttributes() {
    HashMap<String, Object> attributes = new HashMap<>();
    attributes.put("id", user.getId());
    attributes.put("name", user.getFirstname() + " " + user.getLastname());
    attributes.put("email", user.getEmail());
    return attributes;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    List<SimpleGrantedAuthority> roles = new ArrayList<>();
    roles.add(new SimpleGrantedAuthority(ROLE_USER));
    if (user.isAdmin()) {
      roles.add(new SimpleGrantedAuthority(ROLE_ADMIN));
    }
    return roles;
  }

  @Override
  public String getName() {
    return user.getFirstname() + " " + user.getLastname();
  }

}
