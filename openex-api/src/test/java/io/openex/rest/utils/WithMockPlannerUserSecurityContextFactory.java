package io.openex.rest.utils;

import io.openex.database.model.Grant;
import io.openex.database.model.Group;
import io.openex.database.model.User;
import io.openex.database.repository.GrantRepository;
import io.openex.database.repository.GroupRepository;
import io.openex.database.repository.UserRepository;
import io.openex.database.specification.GroupSpecification;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

import static io.openex.database.model.Grant.GRANT_TYPE.PLANNER;
import static io.openex.service.UserService.buildAuthenticationToken;

@Component
public class WithMockPlannerUserSecurityContextFactory implements WithSecurityContextFactory<WithMockPlannerUser> {

  public static final String MOCK_USER_PLANNER_EMAIL = "planner@opencti.io";
  @Autowired
  private GrantRepository grantRepository;
  @Autowired
  private GroupRepository groupRepository;
  @Autowired
  private UserRepository userRepository;

  @Override
  public SecurityContext createSecurityContext(WithMockPlannerUser customUser) {
    User user = this.userRepository.findByEmailIgnoreCase(customUser.email()).orElseThrow();
    Authentication authentication = buildAuthenticationToken(user);
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(authentication);
    return context;
  }

  @PostConstruct
  private void postConstruct() {
    this.createPlannerMockUser();
  }

  @PreDestroy
  public void preDestroy() {
    this.userRepository.deleteById(this.userRepository.findByEmailIgnoreCase(MOCK_USER_PLANNER_EMAIL).orElseThrow().getId());
  }

  private void createPlannerMockUser() {
    if (this.userRepository.findByEmailIgnoreCase(MOCK_USER_PLANNER_EMAIL).isPresent()) {
      return;
    }
    // Create group
    String groupName = "Planner group";
    Optional<Group> groupOpt = this.groupRepository.findOne(GroupSpecification.fromName(groupName));
    Group group;
    if (groupOpt.isEmpty()) {
      Group newGroup = new Group();
      newGroup.setName(groupName);
      newGroup.setScenariosDefaultGrants(List.of(PLANNER));
      group = this.groupRepository.save(newGroup);
      // Create grant
      Grant grant = new Grant();
      grant.setName(PLANNER);
      grant.setGroup(group);
      this.grantRepository.save(grant);
    } else {
      group = groupOpt.get();
    }
    // Create user
    Optional<User> userOpt = this.userRepository.findByEmail(MOCK_USER_PLANNER_EMAIL);
    if (userOpt.isEmpty()) {
      User user = new User();
      user.setGroups(List.of(group));
      user.setEmail(MOCK_USER_PLANNER_EMAIL);
      this.userRepository.save(user);
    }
  }
}
