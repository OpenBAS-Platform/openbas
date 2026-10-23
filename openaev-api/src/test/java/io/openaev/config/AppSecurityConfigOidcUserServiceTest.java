package io.openaev.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;

import io.openaev.config.security.OpenSamlConfig;
import io.openaev.config.security.SecurityService;
import io.openaev.ratelimit.config.RateLimitConfig;
import io.openaev.ratelimit.service.RateLimitService;
import io.openaev.service.UserMappingService;
import io.openaev.service.user_events.UserEventService;
import io.openaev.utils.RequestUtils;
import io.openaev.utils.fixtures.UserFixture;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

@ExtendWith(MockitoExtension.class)
@DisplayName("OIDC login user info retrieval")
class AppSecurityConfigOidcUserServiceTest {

  private static final String EMAIL = "jane@openaev.test";
  // Nothing listens there: any UserInfo call fails with invalid_user_info_response.
  private static final String UNREACHABLE_USER_INFO_URI = "http://127.0.0.1:1/userinfo";

  @Mock private OpenAEVConfig openAEVConfig;
  @Mock private OpenSamlConfig openSamlConfig;
  @Mock private SecurityService securityService;
  @Mock private UserEventService userEventService;
  @Mock private UserMappingService userMappingService;
  @Mock private RateLimitService rateLimitService;
  @Mock private RateLimitConfig rateLimitConfig;
  @Mock private SessionManager sessionManager;
  @Mock private RequestUtils requestUtils;

  private AppSecurityConfig appSecurityConfig;

  @BeforeEach
  void setUp() {
    lenient()
        .when(
            securityService.userManagement(
                eq(EMAIL), eq("idp"), anyList(), anyList(), any(), any()))
        .thenReturn(UserFixture.getUser("Jane", "Doe", EMAIL, false));
    appSecurityConfig =
        new AppSecurityConfig(
            openAEVConfig,
            openSamlConfig,
            securityService,
            userEventService,
            userMappingService,
            rateLimitService,
            rateLimitConfig,
            sessionManager,
            requestUtils,
            Optional.empty());
  }

  @Test
  @DisplayName("given only the openid scope, should log in from the ID token without UserInfo")
  void given_openidScopeOnly_should_notCallUserInfo() {
    // Arrange
    OidcUserRequest request = request(Set.of("openid"));

    // Act
    OidcUser user = appSecurityConfig.oidcUserService().loadUser(request);

    // Assert
    assertThat(user.getEmail()).isEqualTo(EMAIL);
  }

  @Test
  @DisplayName("given the profile scope, should call UserInfo")
  void given_profileScope_should_callUserInfo() {
    // Arrange
    OidcUserRequest request = request(Set.of("openid", "profile"));

    // Act & Assert
    assertThatThrownBy(() -> appSecurityConfig.oidcUserService().loadUser(request))
        .isInstanceOf(OAuth2AuthenticationException.class)
        .hasMessageContaining("invalid_user_info_response");
  }

  private static OidcUserRequest request(Set<String> grantedScopes) {
    ClientRegistration registration =
        ClientRegistration.withRegistrationId("idp")
            .clientId("client")
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
            .scope("openid")
            .authorizationUri("http://127.0.0.1:1/authorize")
            .tokenUri("http://127.0.0.1:1/token")
            .jwkSetUri("http://127.0.0.1:1/jwks")
            .userInfoUri(UNREACHABLE_USER_INFO_URI)
            .userNameAttributeName("sub")
            .build();
    Instant now = Instant.now();
    OAuth2AccessToken accessToken =
        new OAuth2AccessToken(
            OAuth2AccessToken.TokenType.BEARER,
            "access-token",
            now,
            now.plusSeconds(60),
            grantedScopes);
    OidcIdToken idToken =
        OidcIdToken.withTokenValue("id-token")
            .subject("jane")
            .claim("email", EMAIL)
            .issuedAt(now)
            .expiresAt(now.plusSeconds(60))
            .build();
    return new OidcUserRequest(registration, accessToken, idToken);
  }
}
