package io.openbas.utils.mockUser;

import static io.openbas.database.model.Grant.GRANT_TYPE.OBSERVER;
import static io.openbas.service.UserService.buildAuthenticationToken;

import io.openbas.database.model.Grant;
import io.openbas.database.model.Group;
import io.openbas.database.model.User;
import io.openbas.database.repository.GrantRepository;
import io.openbas.database.repository.GroupRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.database.specification.GroupSpecification;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;
import org.springframework.stereotype.Component;

@Component
public class WithMockObserverUserSecurityContextFactory
    implements WithSecurityContextFactory<WithMockObserverUser> {

  public static final String MOCK_USER_OBSERVER_EMAIL = "observer@openbas.io";
  @Autowired private GrantRepository grantRepository;
  @Autowired private GroupRepository groupRepository;
  @Autowired private UserRepository userRepository;

  @Override
  public SecurityContext createSecurityContext(WithMockObserverUser customUser) {
    User user = this.userRepository.findByEmailIgnoreCase(customUser.email()).orElseThrow();
    Authentication authentication = buildAuthenticationToken(user);
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(authentication);
    return context;
  }

  @PostConstruct
  private void postConstruct() {
    this.createObserverMockUser();
  }

  @PreDestroy
  public void preDestroy() {
    this.userRepository.deleteById(
        this.userRepository.findByEmailIgnoreCase(MOCK_USER_OBSERVER_EMAIL).orElseThrow().getId());
  }

  private void createObserverMockUser() {
    if (this.userRepository.findByEmailIgnoreCase(MOCK_USER_OBSERVER_EMAIL).isPresent()) {
      return;
    }

    // Create group
    String groupName = "Observer group";
    Optional<Group> groupOpt = this.groupRepository.findOne(GroupSpecification.fromName(groupName));
    Group group;
    if (groupOpt.isEmpty()) {
      Group newGroup = new Group();
      newGroup.setName(groupName);
      newGroup.setScenariosDefaultGrants(List.of(OBSERVER));
      newGroup.setExercisesDefaultGrants(List.of(OBSERVER));
      group = this.groupRepository.save(newGroup);
      // Create grant
      Grant grant = new Grant();
      grant.setName(OBSERVER);
      grant.setGroup(group);
      this.grantRepository.save(grant);
    } else {
      group = groupOpt.get();
    }
    // Create user
    Optional<User> userOpt = this.userRepository.findByEmailIgnoreCase(MOCK_USER_OBSERVER_EMAIL);
    if (userOpt.isEmpty()) {
      User user = new User();
      user.setGroups(List.of(group));
      user.setEmail(MOCK_USER_OBSERVER_EMAIL);
      this.userRepository.save(user);
    }
  }
}
