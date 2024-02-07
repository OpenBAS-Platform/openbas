package io.openex.rest.utils;

import io.openex.database.model.Grant;
import io.openex.database.model.Group;
import io.openex.database.model.User;
import io.openex.database.repository.GrantRepository;
import io.openex.database.repository.GroupRepository;
import io.openex.database.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.util.List;

import static io.openex.database.model.Grant.GRANT_TYPE.OBSERVER;
import static io.openex.service.UserService.buildAuthenticationToken;

@Component
public class WithMockObserverUserSecurityContextFactory implements WithSecurityContextFactory<WithMockObserverUser> {

  public static final String MOCK_USER_OBSERVER_EMAIL = "observer@opencti.io";
  @Autowired
  private GrantRepository grantRepository;
  @Autowired
  private GroupRepository groupRepository;
  @Autowired
  private UserRepository userRepository;

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
    this.userRepository.deleteById(this.userRepository.findByEmailIgnoreCase(MOCK_USER_OBSERVER_EMAIL).orElseThrow().getId());
  }

  private void createObserverMockUser() {
    if (this.userRepository.findByEmailIgnoreCase(MOCK_USER_OBSERVER_EMAIL).isPresent()) {
      return;
    }

    // Create group
    Group group = new Group();
    group.setName("Observer group");
    group = this.groupRepository.save(group);
    // Create grant
    Grant grant = new Grant();
    grant.setName(OBSERVER);
    grant.setGroup(group);
    this.grantRepository.save(grant);
    // Create user
    User user = new User();
    user.setGroups(List.of(group));
    user.setEmail(MOCK_USER_OBSERVER_EMAIL);
    this.userRepository.save(user);
  }
}
