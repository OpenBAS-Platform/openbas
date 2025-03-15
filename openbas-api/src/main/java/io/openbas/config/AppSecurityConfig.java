package io.openbas.config;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static java.util.Optional.ofNullable;
import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.springframework.util.StringUtils.hasLength;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import io.openbas.database.model.User;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.user.form.user.CreateUserInput;
import io.openbas.security.SsoRefererAuthenticationFailureHandler;
import io.openbas.security.SsoRefererAuthenticationSuccessHandler;
import io.openbas.security.TokenAuthenticationFilter;
import io.openbas.service.UserService;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.saml2.core.Saml2Error;
import org.springframework.security.saml2.provider.service.authentication.OpenSaml4AuthenticationProvider;
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal;
import org.springframework.security.saml2.provider.service.authentication.Saml2Authentication;
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticationException;
import org.springframework.security.saml2.provider.service.metadata.OpenSamlMetadataResolver;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository;
import org.springframework.security.saml2.provider.service.web.DefaultRelyingPartyRegistrationResolver;
import org.springframework.security.saml2.provider.service.web.Saml2MetadataFilter;
import org.springframework.security.saml2.provider.service.web.authentication.Saml2WebSsoAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;

@Configuration
@EnableWebSecurity
public class AppSecurityConfig {

  private static final Logger LOGGER = Logger.getLogger(AppSecurityConfig.class.getName());

  private UserRepository userRepository;
  private UserService userService;
  private OpenBASConfig openBASConfig;
  private Environment env;

  @Resource protected ObjectMapper mapper;

  @Autowired
  public void setEnv(Environment env) {
    this.env = env;
  }

  @Autowired
  public void setOpenBASConfig(OpenBASConfig openBASConfig) {
    this.openBASConfig = openBASConfig;
  }

  @Autowired
  public void setUserService(UserService userService) {
    this.userService = userService;
  }

  @Autowired
  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Autowired(required = false)
  private RelyingPartyRegistrationRepository relyingPartyRegistrationRepository;

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.addFilterBefore(tokenAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
        .requestCache(Customizer.withDefaults())
        /**/ .requestCache((cache) -> cache.requestCache(new HttpSessionRequestCache()))
        .csrf(AbstractHttpConfigurer::disable)
        .formLogin(AbstractHttpConfigurer::disable)
        .securityContext((securityContext) -> securityContext.requireExplicitSave(false))
        .authorizeHttpRequests(
            rq ->
                rq.requestMatchers("/api/health")
                    .permitAll()
                    .requestMatchers("/api/comcheck/**")
                    .permitAll()
                    .requestMatchers("/api/player/**")
                    .permitAll()
                    .requestMatchers("/api/settings")
                    .permitAll()
                    .requestMatchers("/api/agent/**")
                    .permitAll()
                    .requestMatchers("/api/implant/**")
                    .permitAll()
                    .requestMatchers("/api/login")
                    .permitAll()
                    .requestMatchers("/api/reset/**")
                    .permitAll()
                    .requestMatchers("/api/**")
                    .authenticated()
                    .anyRequest()
                    .permitAll())
        .logout(
            logout ->
                logout
                    .invalidateHttpSession(true)
                    .deleteCookies("JSESSIONID", openBASConfig.getCookieName())
                    .logoutSuccessUrl(
                        env.getProperty("openbas.base-url", String.class, "/")
                            + env.getProperty("openbas.logout-success-url", String.class, "/")));

    if (openBASConfig.isAuthOpenidEnable()) {
      http.oauth2Login(
          login ->
              login
                  .successHandler(new SsoRefererAuthenticationSuccessHandler())
                  .failureHandler(new SsoRefererAuthenticationFailureHandler()));
    }

    if (openBASConfig.isAuthSaml2Enable()) {
      DefaultRelyingPartyRegistrationResolver relyingPartyRegistrationResolver =
          new DefaultRelyingPartyRegistrationResolver(this.relyingPartyRegistrationRepository);
      Saml2MetadataFilter filter =
          new Saml2MetadataFilter(relyingPartyRegistrationResolver, new OpenSamlMetadataResolver());

      OpenSaml4AuthenticationProvider authenticationProvider = getOpenSaml4AuthenticationProvider();

      http.addFilterBefore(filter, Saml2WebSsoAuthenticationFilter.class)
          .saml2Login(
              saml2Login ->
                  saml2Login
                      .authenticationManager(new ProviderManager(authenticationProvider))
                      .successHandler(new SsoRefererAuthenticationSuccessHandler()));
    }

    // Rewrite 403 code to 401
    http.exceptionHandling(
        exceptionHandling ->
            exceptionHandling.authenticationEntryPoint(
                (request, response, authException) ->
                    response.setStatus(HttpStatus.UNAUTHORIZED.value())));

    return http.build();
  }

  @Bean
  public TokenAuthenticationFilter tokenAuthenticationFilter() {
    return new TokenAuthenticationFilter();
  }

  private List<String> extractRolesFromToken(OAuth2AccessToken accessToken, String registrationId) {
    ObjectReader listReader = mapper.readerFor(new TypeReference<List<String>>() {});
    if (accessToken != null) {
      String rolesPathConfig = "openbas.provider." + registrationId + ".roles_path";
      //noinspection unchecked
      List<String> rolesPath =
          env.getProperty(rolesPathConfig, List.class, new ArrayList<String>());
      try {
        String[] chunks = accessToken.getTokenValue().split("\\.");
        Base64.Decoder decoder = Base64.getUrlDecoder();
        String payload = new String(decoder.decode(chunks[1]));
        JsonNode jsonNode = mapper.readTree(payload);
        return rolesPath.stream()
            .map(path -> "/" + path.replaceAll("\\.", "/"))
            .flatMap(
                path -> {
                  JsonNode arrayRoles = jsonNode.at(path);
                  try {
                    List<String> roles = listReader.readValue(arrayRoles);
                    return roles.stream();
                  } catch (IOException e) {
                    return Stream.empty();
                  }
                })
            .toList();
      } catch (Exception e) {
        LOGGER.log(Level.SEVERE, e.getMessage(), e);
      }
    }
    return new ArrayList<>();
  }

  private List<String> extractRolesFromUser(
      Saml2AuthenticatedPrincipal user, String registrationId) {
    String rolesPathConfig = "openbas.provider." + registrationId + ".roles_path";
    //noinspection unchecked
    List<String> rolesPath = env.getProperty(rolesPathConfig, List.class, new ArrayList<String>());
    try {
      return rolesPath.stream()
          .flatMap(
              path -> {
                try {
                  List<String> roles = user.getAttribute(path);
                  assert roles != null;
                  return roles.stream();
                } catch (NullPointerException e) {
                  return Stream.empty();
                }
              })
          .toList();
    } catch (Exception e) {
      LOGGER.log(Level.SEVERE, e.getMessage(), e);
    }
    return new ArrayList<>();
  }

  public User userManagement(
      String emailAttribute,
      String registrationId,
      List<String> rolesFromToken,
      String firstName,
      String lastName) {
    String email = ofNullable(emailAttribute).orElseThrow();
    String rolesAdminConfig = "openbas.provider." + registrationId + ".roles_admin";
    String allAdminConfig = "openbas.provider." + registrationId + ".all_admin";
    //noinspection unchecked
    List<String> rolesAdmin =
        this.env.getProperty(rolesAdminConfig, List.class, new ArrayList<String>());
    boolean allAdmin = this.env.getProperty(allAdminConfig, Boolean.class, false);
    boolean isAdmin = allAdmin || rolesAdmin.stream().anyMatch(rolesFromToken::contains);
    if (hasLength(email)) {
      Optional<User> optionalUser = userRepository.findByEmailIgnoreCase(email);
      // If user not exists, create it
      if (optionalUser.isEmpty()) {
        CreateUserInput createUserInput = new CreateUserInput();
        createUserInput.setEmail(email);
        createUserInput.setFirstname(firstName);
        createUserInput.setLastname(lastName);
        if (allAdmin || !rolesAdmin.isEmpty()) {
          createUserInput.setAdmin(isAdmin);
        }
        return this.userService.createUser(createUserInput, 0);
      } else {
        // If user exists, update it
        User currentUser = optionalUser.get();
        currentUser.setFirstname(firstName);
        currentUser.setLastname(lastName);
        if (allAdmin || !rolesAdmin.isEmpty()) {
          currentUser.setAdmin(isAdmin);
        }
        return this.userService.updateUser(currentUser);
      }
    }
    return null;
  }

  public User userOauth2Management(
      OAuth2AccessToken accessToken, ClientRegistration clientRegistration, OAuth2User user) {
    String emailAttribute = user.getAttribute("email");
    String registrationId = clientRegistration.getRegistrationId();
    List<String> rolesFromToken = extractRolesFromToken(accessToken, registrationId);
    if (isBlank(emailAttribute)) {
      OAuth2Error authError =
          new OAuth2Error(
              "invalid_configuration",
              "You probably need a public email in your " + registrationId + " account",
              "");
      throw new OAuth2AuthenticationException(authError);
    }
    User userLogin =
        userManagement(
            emailAttribute,
            registrationId,
            rolesFromToken,
            user.getAttribute("given_name"),
            user.getAttribute("family_name"));

    if (userLogin != null) {
      return userLogin;
    }

    OAuth2Error authError = new OAuth2Error("invalid_token", "User conversion fail", "");
    throw new OAuth2AuthenticationException(authError);
  }

  public User userSaml2Management(Saml2AuthenticatedPrincipal user) {
    String emailAttribute = user.getName();
    String registrationId = user.getRelyingPartyRegistrationId();
    List<String> rolesFromUser = extractRolesFromUser(user, registrationId);
    User userLogin = null;
    try {
      userLogin =
          userManagement(
              emailAttribute,
              registrationId,
              rolesFromUser,
              user.getFirstAttribute(
                  env.getProperty(
                      "openbas.provider." + registrationId + ".firstname_attribute_key",
                      String.class,
                      "")),
              user.getFirstAttribute(
                  env.getProperty(
                      "openbas.provider." + registrationId + ".lastname_attribute_key",
                      String.class,
                      "")));
    } catch (Exception e) {
      LOGGER.log(Level.SEVERE, e.getMessage(), e);
    }

    if (userLogin != null) {
      return userLogin;
    }

    Saml2Error authError = new Saml2Error("invalid_token", "User conversion fail");
    throw new Saml2AuthenticationException(authError);
  }

  public OidcUser oidcUserManagement(
      OAuth2AccessToken accessToken, ClientRegistration clientRegistration, OAuth2User user) {
    User loginUser = userOauth2Management(accessToken, clientRegistration, user);
    return new OpenBASOidcUser(loginUser);
  }

  public OAuth2User oAuth2UserManagement(
      OAuth2AccessToken accessToken, ClientRegistration clientRegistration, OAuth2User user) {
    User loginUser = userOauth2Management(accessToken, clientRegistration, user);
    return new OpenBASOAuth2User(loginUser);
  }

  public Saml2Authentication saml2UserManagement(Saml2Authentication authentication) {
    Saml2AuthenticatedPrincipal user = (Saml2AuthenticatedPrincipal) authentication.getPrincipal();
    User loginUser = userSaml2Management(user);

    List<SimpleGrantedAuthority> roles = new ArrayList<>();
    roles.add(new SimpleGrantedAuthority(ROLE_USER));
    if (loginUser.isAdmin()) {
      roles.add(new SimpleGrantedAuthority(ROLE_ADMIN));
    }

    return new Saml2Authentication(
        new OpenBASSaml2User(loginUser, roles), authentication.getSaml2Response(), roles);
  }

  @Bean
  public OAuth2UserService<OidcUserRequest, OidcUser> oidcUserService() {
    OidcUserService delegate = new OidcUserService();
    return request ->
        oidcUserManagement(
            request.getAccessToken(), request.getClientRegistration(), delegate.loadUser(request));
  }

  @Bean
  public OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
    DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
    return request ->
        oAuth2UserManagement(
            request.getAccessToken(), request.getClientRegistration(), delegate.loadUser(request));
  }

  private OpenSaml4AuthenticationProvider getOpenSaml4AuthenticationProvider() {
    OpenSaml4AuthenticationProvider authenticationProvider = new OpenSaml4AuthenticationProvider();
    authenticationProvider.setResponseAuthenticationConverter(
        responseToken -> {
          Saml2Authentication authentication =
              OpenSaml4AuthenticationProvider.createDefaultResponseAuthenticationConverter()
                  .convert(responseToken);
          assert authentication != null;
          return saml2UserManagement(authentication);
        });
    return authenticationProvider;
  }
}
