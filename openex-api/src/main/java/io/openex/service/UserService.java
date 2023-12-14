package io.openex.service;

import io.openex.config.OpenexPrincipal;
import io.openex.database.model.Group;
import io.openex.database.model.Token;
import io.openex.database.model.User;
import io.openex.database.repository.*;
import io.openex.database.specification.GroupSpecification;
import io.openex.rest.user.form.user.CreateUserInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.database.model.User.ROLE_USER;
import static io.openex.helper.DatabaseHelper.updateRelation;
import static io.openex.helper.StreamHelper.fromIterable;
import static java.time.Instant.now;

@Service
public class UserService {

  private final Argon2PasswordEncoder passwordEncoder = Argon2PasswordEncoder.defaultsForSpringSecurity_v5_2();
  private UserRepository userRepository;
  private TokenRepository tokenRepository;
  private TagRepository tagRepository;
  private GroupRepository groupRepository;
  private OrganizationRepository organizationRepository;

  @Autowired
  public void setOrganizationRepository(OrganizationRepository organizationRepository) {
    this.organizationRepository = organizationRepository;
  }

  @Autowired
  public void setTagRepository(TagRepository tagRepository) {
    this.tagRepository = tagRepository;
  }

  @Autowired
  public void setGroupRepository(GroupRepository groupRepository) {
    this.groupRepository = groupRepository;
  }

  @Autowired
  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Autowired
  public void setTokenRepository(TokenRepository tokenRepository) {
    this.tokenRepository = tokenRepository;
  }

  // region users
  public boolean isUserPasswordValid(User user, String password) {
    return passwordEncoder.matches(password, user.getPassword());
  }

  public void createUserSession(User user) {
    List<SimpleGrantedAuthority> roles = new ArrayList<>();
    roles.add(new SimpleGrantedAuthority(ROLE_USER));
    if (user.isAdmin()) {
      roles.add(new SimpleGrantedAuthority(ROLE_ADMIN));
    }
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new PreAuthenticatedAuthenticationToken(new OpenexPrincipal() {
      @Override
      public String getId() {
        return user.getId();
      }

      @Override
      public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles;
      }

      @Override
      public boolean isAdmin() {
        return user.isAdmin();
      }
    }, "", roles));
    SecurityContextHolder.setContext(context);
  }

  public String encodeUserPassword(String password) {
    return passwordEncoder.encode(password);
  }

  public void createUserToken(User user) {
    Token token = new Token();
    token.setUser(user);
    token.setCreated(now());
    token.setValue(UUID.randomUUID().toString());
    tokenRepository.save(token);
  }

  public User updateUser(User user) {
    return userRepository.save(user);
  }

  public User createUser(CreateUserInput input, int status) {
    User user = new User();
    user.setUpdateAttributes(input);
    user.setStatus((short) status);
    if (StringUtils.hasLength(input.getPassword())) {
      user.setPassword(encodeUserPassword(input.getPassword()));
    }
    user.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    user.setOrganization(updateRelation(input.getOrganizationId(), user.getOrganization(), organizationRepository));
    // Find automatic groups to assign
    List<Group> assignableGroups = groupRepository.findAll(GroupSpecification.defaultUserAssignable());
    user.setGroups(assignableGroups);
    // Save the user
    User savedUser = userRepository.save(user);
    createUserToken(savedUser);
    return savedUser;
  }

  public User user(@NotBlank final String userId) {
    return this.userRepository.findById(userId).orElseThrow();
  }

  // endregion
}
