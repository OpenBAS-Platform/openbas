package io.openaev.utils.fixtures;

import io.openaev.context.TenantContext;
import io.openaev.database.model.SecurityPlatform;
import io.openaev.database.model.Tenant;

public class SecurityPlatformFixture {
  public static SecurityPlatform createDefault(String name, String type) {
    SecurityPlatform edr = new SecurityPlatform();
    edr.setSecurityPlatformType(SecurityPlatform.SECURITY_PLATFORM_TYPE.valueOf(type));
    edr.setName(name);
    edr.setDescription("I don't see anything, hear anything, say anything");
    // assets is tenant-active and Asset's TenantBaseListener was removed at go-live: stamp the
    // tenant explicitly here, the way SecurityCoverageFixture and AssetGroupFixture already do,
    // instead of leaving every call site to remember it. TenantContext.getCurrentTenant() never
    // throws (it defaults to Tenant.DEFAULT_TENANT_UUID), so this is safe outside a request too.
    edr.setTenant(new Tenant(TenantContext.getCurrentTenant()));
    return edr;
  }
}
