package io.openbas.utils.fixtures;

import io.openbas.database.model.SecurityPlatform;

public class SecurityPlatformFixture {

  public static SecurityPlatform createSecurityPlatform(
      String name, SecurityPlatform.SECURITY_PLATFORM_TYPE type) {
    SecurityPlatform securityPlatform = new SecurityPlatform();
    securityPlatform.setName(name);
    securityPlatform.setSecurityPlatformType(type);
    return securityPlatform;
  }
}
