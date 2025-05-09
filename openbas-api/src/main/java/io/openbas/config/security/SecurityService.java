package io.openbas.config.security;

import static java.util.Optional.ofNullable;
import static org.springframework.util.StringUtils.hasLength;

import io.openbas.database.model.User;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.user.form.user.CreateUserInput;
import io.openbas.service.UserService;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SecurityService {

  public static final String OPENBAS_PROVIDER_PATH_PREFIX = "openbas.provider.";
  public static final String ROLES_ADMIN_PATH_SUFFIX = ".roles_admin";
  public static final String ALL_ADMIN_PATH_SUFFIX = ".all_admin";

  private final UserRepository userRepository;
  private final UserService userService;
  private final Environment env;

  public User userManagement(
      String emailAttribute,
      String registrationId,
      List<String> rolesFromToken,
      String firstName,
      String lastName) {
    String email = ofNullable(emailAttribute).orElseThrow();
    List<String> adminRoles = getAdminRoles(registrationId);
    boolean allAdmin = isAllAdmin(registrationId);
    boolean isAdmin = allAdmin || adminRoles.stream().anyMatch(rolesFromToken::contains);
    if (hasLength(email)) {
      Optional<User> optionalUser = userRepository.findByEmailIgnoreCase(email);
      // If user not exists, create it
      if (optionalUser.isEmpty()) {
        CreateUserInput createUserInput = new CreateUserInput();
        createUserInput.setEmail(email);
        createUserInput.setFirstname(firstName);
        createUserInput.setLastname(lastName);
        if (allAdmin || !adminRoles.isEmpty()) {
          createUserInput.setAdmin(isAdmin);
        }
        return this.userService.createUser(createUserInput, 0);
      } else {
        // If user exists, update it
        User currentUser = optionalUser.get();
        currentUser.setFirstname(firstName);
        currentUser.setLastname(lastName);
        if (allAdmin || !adminRoles.isEmpty()) {
          currentUser.setAdmin(isAdmin);
        }
        return this.userService.updateUser(currentUser);
      }
    }
    return null;
  }

  // -- PRIVATE --

  private List<String> getAdminRoles(@NotBlank final String registrationId) {
    String rolesAdminConfig =
        OPENBAS_PROVIDER_PATH_PREFIX + registrationId + ROLES_ADMIN_PATH_SUFFIX;
    //noinspection unchecked
    return this.env.getProperty(rolesAdminConfig, List.class, new ArrayList<String>());
  }

  private Boolean isAllAdmin(@NotBlank final String registrationId) {
    String allAdminConfig = OPENBAS_PROVIDER_PATH_PREFIX + registrationId + ALL_ADMIN_PATH_SUFFIX;
    return this.env.getProperty(allAdminConfig, Boolean.class, false);
  }
}
