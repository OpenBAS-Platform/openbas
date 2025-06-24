package io.openbas.service;

import io.openbas.database.model.*;
import jakarta.validation.constraints.NotNull;
import java.util.EnumSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class PermissionService {

  private static final EnumSet<ResourceType> RESSOURCES_MANAGED_BY_GRANTS =
      EnumSet.of(ResourceType.SCENARIO, ResourceType.SIMULATION);
  private final GrantService grantService;

  @Transactional
  public boolean hasPermission(
      @NotNull final User user,
      final String resourceId,
      final ResourceType resourceType,
      final Action action) {

    if (user.isAdmin()) {
      return true;
    }

    /************ GRANT ************/
    // Scenario and simulation are  only accessible by GRANT
    if (RESSOURCES_MANAGED_BY_GRANTS.contains(resourceType)) {

      // user can access search apis but the result will be filtered
      if (Action.SEARCH.equals(action)) {
        return true;
      }

      if (Action.READ.equals(action)) {
        return grantService.hasReadGrant(resourceId, user);
      } else if (Action.WRITE.equals(action)) {
        return grantService.hasWriteGrant(resourceId, user);
      } else if (Action.LAUNCH.equals(action)) {
        return grantService.hasLaunchGrant(resourceId, user);
      }
    } else {
      /************ CAPA ************/
      Set<Capability> userCapabilities = user.getCapabilities();

      if (userCapabilities.contains(Capability.BYPASS)) {
        return true;
      }

      Capability requiredCapability = Capability.of(resourceType, action).orElse(Capability.BYPASS);

      if (userCapabilities.contains(requiredCapability)) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
}
