package io.openbas.service;

import io.openbas.database.model.Action;
import io.openbas.database.model.Capability;
import io.openbas.database.model.ResourceType;
import io.openbas.database.model.User;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class PermissionService {

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
    if (ResourceType.SCENARIO.equals(resourceType)
        || ResourceType.SIMULATION.equals(resourceType)) {

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
