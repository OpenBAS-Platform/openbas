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

  private static final EnumSet<ResourceType> RESOURCES_OPEN =
      EnumSet.of(ResourceType.PLAYER, ResourceType.TEAM);
  private static final EnumSet<ResourceType> RESOURCES_MANAGED_BY_GRANTS =
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

    // if for some reason we are not able to identify the resource we only allow admin
    if (ResourceType.UNKNOWN.equals(resourceType)) {
      return user.isAdmin();
    }

    // Scenario and simulation are  only accessible by GRANT
    if (RESOURCES_MANAGED_BY_GRANTS.contains(resourceType)) {
      // creation and duplication are managed using capa
      if (Action.CREATE.equals(action) || Action.DUPLICATE.equals(action)) {
        return hasCapaPermission(user, resourceType, action);
      }
      return hasGrantPermission(user, resourceId, resourceType, action);
    } else {
      return hasCapaPermission(user, resourceType, action);
    }
  }

  private boolean hasGrantPermission(
      @NotNull final User user,
      final String resourceId,
      @NotNull final ResourceType resourceType,
      @NotNull final Action action) {
    // user can access search apis but the result will be filtered
    if (Action.SEARCH.equals(action)) {
      return true;
    }

    switch (action) {
      case READ:
        return grantService.hasReadGrant(resourceId, user);
      case WRITE, DELETE:
        return grantService.hasWriteGrant(resourceId, user);
      case LAUNCH:
        return grantService.hasLaunchGrant(resourceId, user);
      default:
        return false;
    }
  }

  private boolean hasCapaPermission(
      @NotNull final User user,
      @NotNull final ResourceType resourceType,
      @NotNull final Action action) {
    Set<Capability> userCapabilities = user.getCapabilities();

    if (userCapabilities.contains(Capability.BYPASS)) {
      return true;
    }

    if (RESOURCES_OPEN.contains(resourceType) && Action.READ.equals(action)) {
      return true;
    }

    Capability requiredCapability = Capability.of(resourceType, action).orElse(Capability.BYPASS);

    if (userCapabilities.contains(requiredCapability)) {
      return true;
    } else {
      return false;
    }
  }
}
