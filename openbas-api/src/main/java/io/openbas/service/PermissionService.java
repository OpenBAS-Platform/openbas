package io.openbas.service;

import io.openbas.database.model.*;
import io.openbas.rest.inject.service.InjectService;
import jakarta.validation.constraints.NotNull;
import java.util.EnumSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class PermissionService {

  // TODO: today settings are necessary to login -> review that
  private static final EnumSet<ResourceType> RESOURCES_OPEN =
      EnumSet.of(
          ResourceType.PLAYER,
          ResourceType.TEAM,
          ResourceType.PLATFORM_SETTING,
          ResourceType.CVE,
          ResourceType.TAG,
          ResourceType.ATTACK_PATTERN,
          ResourceType.KILL_CHAIN_PHASE,
          ResourceType.ORGANIZATION); // TODO review open apis see issue/3789

  private static final EnumSet<ResourceType> RESOURCES_MANAGED_BY_GRANTS =
      EnumSet.of(
          ResourceType.SCENARIO, ResourceType.SIMULATION, ResourceType.SIMULATION_OR_SCENARIO);

  private static final EnumSet<ResourceType> RESOURCES_USING_PARENT_PERMISSION =
      EnumSet.of(ResourceType.INJECT);

  private final GrantService grantService;
  private final InjectService injectService;

  @Transactional
  public boolean hasPermission(
      @NotNull final User user, String resourceId, ResourceType resourceType, Action action) {

    if (user.isAdmin()) {
      return true;
    }

    // if for some reason we are not able to identify the resource we only allow admin
    if (ResourceType.UNKNOWN.equals(resourceType)) {
      return user.isAdmin();
    }

    // for inject/article the permission will be based on the parent's (scenario/simulation/test)
    // permission
    if (RESOURCES_USING_PARENT_PERMISSION.contains(resourceType)) {
      Target parentTarget = resolveTarget(resourceId, resourceType, action);
      resourceId = parentTarget.resourceId;
      resourceType = parentTarget.resourceType;
      action = parentTarget.action;
    }

    // Scenario and simulation are  only accessible by GRANT
    if (RESOURCES_MANAGED_BY_GRANTS.contains(resourceType)) {

      // creation and duplication are managed using capa
      if (Action.CREATE.equals(action)) {
        return hasCapaPermission(user, resourceType, action);
      }
      if (Action.DUPLICATE.equals(action)) {
        // to duplicate we need the "create" capa but also read on the resource
        return hasCapaPermission(user, resourceType, action)
            && hasGrantPermission(user, resourceId, resourceType, Action.READ);
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
    Set<Capability> userCapabilities = user.getCapabilities();

    if (userCapabilities.contains(Capability.BYPASS)) {
      return true;
    }
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

    if (RESOURCES_OPEN.contains(resourceType)
        && (Action.READ.equals(action) || Action.SEARCH.equals(action))) {
      return true;
    }

    Capability requiredCapability = Capability.of(resourceType, action).orElse(Capability.BYPASS);

    return userCapabilities.contains(requiredCapability);
  }

  private Target resolveTarget(
      @NotNull final String resourceId,
      @NotNull final ResourceType resourceType,
      @NotNull final Action action) {
    if (resourceType == ResourceType.INJECT) {
      Inject inject = injectService.inject(resourceId);
      // parent action rule: anything non-READ becomes WRITE on the parent
      Action parentAction = (action == Action.READ) ? Action.READ : Action.WRITE;
      return new Target(inject.getParentResourceId(), inject.getParentResourceType(), parentAction);
    }
    return new Target(resourceId, resourceType, action);
  }

  /** Used to return Parent resource information */
  private record Target(String resourceId, ResourceType resourceType, Action action) {}
}
