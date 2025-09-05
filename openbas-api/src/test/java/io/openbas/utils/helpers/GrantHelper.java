package io.openbas.utils.helpers;

import static io.openbas.config.SessionHelper.currentUser;

import io.openbas.config.OpenBASPrincipal;
import io.openbas.database.model.*;
import io.openbas.database.repository.GrantRepository;
import io.openbas.database.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class GrantHelper {
  @Autowired private GrantRepository grantRepository;
  @Autowired private UserRepository userRepository;

  private List<Group> getAmbientSecurityContextGroups() {
    OpenBASPrincipal principal = currentUser();
    Optional<User> user = this.userRepository.findById(principal.getId());

    if (user.isEmpty()) {
      throw new IllegalStateException("No user found");
    }

    return user.get().getGroups();
  }

  private Grant createGrantForGroup(Group group) {
    Grant grant = new Grant();
    grant.setGroup(group);
    return grant;
  }

  public void grantExerciseObserver(Exercise exercise) {
    for (Group group : getAmbientSecurityContextGroups()) {
      Grant grant = createGrantForGroup(group);
      grant.setResourceId(exercise.getId());
      grant.setGrantResourceType(Grant.GRANT_RESOURCE_TYPE.SIMULATION);
      grant.setName(Grant.GRANT_TYPE.OBSERVER);
      this.grantRepository.save(grant);
    }
  }

  public void grantExercisePlanner(Exercise exercise) {
    for (Group group : getAmbientSecurityContextGroups()) {
      Grant grant = createGrantForGroup(group);
      grant.setResourceId(exercise.getId());
      grant.setGrantResourceType(Grant.GRANT_RESOURCE_TYPE.SIMULATION);
      grant.setName(Grant.GRANT_TYPE.PLANNER);
      this.grantRepository.save(grant);
    }
  }

  public void grantScenarioObserver(Scenario scenario) {
    for (Group group : getAmbientSecurityContextGroups()) {
      Grant grant = createGrantForGroup(group);
      grant.setResourceId(scenario.getId());
      grant.setGrantResourceType(Grant.GRANT_RESOURCE_TYPE.SCENARIO);
      grant.setName(Grant.GRANT_TYPE.OBSERVER);
      this.grantRepository.save(grant);
    }
  }

  public void grantScenarioPlanner(Scenario scenario) {
    for (Group group : getAmbientSecurityContextGroups()) {
      Grant grant = createGrantForGroup(group);
      grant.setResourceId(scenario.getId());
      grant.setGrantResourceType(Grant.GRANT_RESOURCE_TYPE.SCENARIO);
      grant.setName(Grant.GRANT_TYPE.PLANNER);
      this.grantRepository.save(grant);
    }
  }
}
