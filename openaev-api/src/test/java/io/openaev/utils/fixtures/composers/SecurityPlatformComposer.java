package io.openaev.utils.fixtures.composers;

import io.openaev.context.TenantContext;
import io.openaev.database.model.SecurityPlatform;
import io.openaev.database.model.Tenant;
import io.openaev.database.repository.SecurityPlatformRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SecurityPlatformComposer extends ComposerBase<SecurityPlatform> {
  @Autowired private SecurityPlatformRepository securityPlatformRepository;

  public class Composer extends InnerComposerBase<SecurityPlatform> {
    private final SecurityPlatform securityPlatform;

    public Composer(SecurityPlatform securityPlatform) {
      this.securityPlatform = securityPlatform;
    }

    @Override
    public Composer persist() {
      // assets is tenant-active and Asset carries no TenantBaseListener any more, so an entity a
      // test built by hand has no tenant and the insert fails on the NOT NULL column. Stamp the
      // ambient tenant here, and only when the caller left it unset, so a test that attributes
      // deliberately (isolation tests, cross-tenant fixtures) keeps full control.
      //
      // This sits in the composer rather than the fixture, unlike SecurityCoverage and AssetGroup:
      // sixty-three tests build assets directly and never reach the fixture. The composer is the
      // test-side persistence gateway, so it is where the harness can mirror what production now
      // demands explicitly. Production keeps no such fallback, which is the part that matters.
      if (this.securityPlatform.getTenant() == null) {
        this.securityPlatform.setTenant(new Tenant(TenantContext.getCurrentTenant()));
      }
      securityPlatformRepository.save(this.securityPlatform);
      return this;
    }

    @Override
    public Composer delete() {
      securityPlatformRepository.delete(this.securityPlatform);
      return this;
    }

    @Override
    public SecurityPlatform get() {
      return this.securityPlatform;
    }
  }

  public Composer forSecurityPlatform(SecurityPlatform securityPlatform) {
    this.generatedItems.add(securityPlatform);
    return new Composer(securityPlatform);
  }
}
