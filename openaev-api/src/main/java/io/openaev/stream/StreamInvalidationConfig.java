package io.openaev.stream;

import io.micrometer.core.instrument.MeterRegistry;
import io.openaev.config.OpenAEVConfig;
import io.openaev.config.TenantUriUtils;
import io.openaev.config.cache.TenantMembershipCacheManager;
import io.openaev.context.TenantScopedTransaction;
import io.openaev.rest.custom_dashboard.CustomDashboardService;
import io.openaev.rest.exercise.service.ExerciseService;
import io.openaev.rest.finding.FindingService;
import io.openaev.rest.inject.service.InjectService;
import io.openaev.rest.injector_contract.InjectorContractService;
import io.openaev.rest.reporting.ReportingService;
import io.openaev.rest.settings.PreviewFeature;
import io.openaev.service.AssetGroupService;
import io.openaev.service.AssetService;
import io.openaev.service.PermissionService;
import io.openaev.service.TeamService;
import io.openaev.service.UserService;
import io.openaev.service.credential.CredentialService;
import io.openaev.service.organization.OrganizationService;
import io.openaev.service.scenario.ScenarioService;
import jakarta.servlet.ServletContext;
import jakarta.websocket.server.ServerContainer;
import java.time.Clock;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.Session;
import org.springframework.session.SessionRepository;
import org.springframework.util.StringUtils;
import org.springframework.web.context.ServletContextAware;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * The live-invalidation stream: a plain WebSocket endpoint (no STOMP, no broker) at {@value
 * #ENDPOINT} that tells browsers which lists changed, so they refetch them.
 *
 * <p>Everything is gated by {@link PreviewFeature#STREAM_INVALIDATION}: with the feature off this
 * configuration is skipped, and since no class of this package is a component, no bean of it, no
 * endpoint, no listener and no scheduled task exists.
 *
 * <p>The package stays outside {@code io.openaev.rest} and {@code io.openaev.api} on purpose: its
 * checks run outside any HTTP request and open their transactions through {@link
 * TenantScopedTransaction}, which the architecture rules forbid to HTTP-side classes.
 */
@Configuration
@EnableWebSocket
@Conditional(StreamInvalidationCondition.class)
public class StreamInvalidationConfig {

  static final String ENDPOINT = "/api/tenants/*/ws";
  static final int MAX_INCOMING_MESSAGE_BYTES = 16 * 1024;

  @Bean
  public StreamMetrics streamMetrics(MeterRegistry meterRegistry) {
    return new StreamMetrics(meterRegistry);
  }

  @Bean
  public StreamConnectionRegistry streamConnectionRegistry(StreamMetrics streamMetrics) {
    return new StreamConnectionRegistry(streamMetrics);
  }

  @Bean
  public StreamTopicAuthorizer streamTopicAuthorizer(
      UserService userService,
      PermissionService permissionService,
      InjectService injectService,
      ScenarioService scenarioService,
      ExerciseService exerciseService,
      AssetService assetService,
      AssetGroupService assetGroupService,
      FindingService findingService,
      TeamService teamService,
      OrganizationService organizationService,
      InjectorContractService injectorContractService,
      CredentialService credentialService,
      CustomDashboardService customDashboardService,
      ReportingService reportingService,
      TenantMembershipCacheManager tenantMembershipCacheManager) {
    return new StreamTopicAuthorizer(
        userService,
        permissionService,
        injectService,
        scenarioService,
        exerciseService,
        assetService,
        assetGroupService,
        findingService,
        teamService,
        organizationService,
        injectorContractService,
        credentialService,
        customDashboardService,
        reportingService,
        tenantMembershipCacheManager);
  }

  @Bean
  public StreamInvalidationBuffer streamInvalidationBuffer(
      StreamConnectionRegistry streamConnectionRegistry, StreamMetrics streamMetrics) {
    return new StreamInvalidationBuffer(streamConnectionRegistry, streamMetrics, Clock.systemUTC());
  }

  @Bean
  public StreamInvalidationListener streamInvalidationListener(
      StreamInvalidationBuffer streamInvalidationBuffer, StreamMetrics streamMetrics) {
    return new StreamInvalidationListener(streamInvalidationBuffer, streamMetrics);
  }

  @Bean
  public StreamHeartbeat streamHeartbeat(
      StreamConnectionRegistry streamConnectionRegistry,
      StreamTopicAuthorizer streamTopicAuthorizer,
      TenantMembershipCacheManager tenantMembershipCacheManager,
      SessionRepository<? extends Session> sessionRepository,
      TenantScopedTransaction tenantScopedTransaction,
      StreamMetrics streamMetrics) {
    return new StreamHeartbeat(
        streamConnectionRegistry,
        streamTopicAuthorizer,
        tenantMembershipCacheManager,
        sessionRepository,
        tenantScopedTransaction,
        streamMetrics);
  }

  @Bean
  public StreamHandshakeInterceptor streamHandshakeInterceptor(
      TenantUriUtils tenantUriUtils,
      TenantMembershipCacheManager tenantMembershipCacheManager,
      StreamMetrics streamMetrics) {
    return new StreamHandshakeInterceptor(
        tenantUriUtils, tenantMembershipCacheManager, streamMetrics);
  }

  @Bean
  public StreamWebSocketHandler streamWebSocketHandler(
      StreamConnectionRegistry streamConnectionRegistry,
      StreamTopicAuthorizer streamTopicAuthorizer,
      TenantScopedTransaction tenantScopedTransaction,
      StreamMetrics streamMetrics) {
    return new StreamWebSocketHandler(
        streamConnectionRegistry,
        streamTopicAuthorizer,
        tenantScopedTransaction,
        streamMetrics,
        Clock.systemUTC());
  }

  /**
   * Registers the endpoint behind Spring's origin check: the origin of {@code openaev.base-url},
   * plus {@code openaev.stream.allowed-origins} (e.g. the Vite dev server's origin).
   */
  @Bean
  public WebSocketConfigurer streamWebSocketConfigurer(
      StreamWebSocketHandler streamWebSocketHandler,
      StreamHandshakeInterceptor streamHandshakeInterceptor,
      OpenAEVConfig openAEVConfig,
      @Value("${openaev.stream.allowed-origins:}") List<String> extraAllowedOrigins) {
    String[] allowedOrigins =
        allowedOrigins(openAEVConfig.getBaseUrl(), extraAllowedOrigins).toArray(String[]::new);
    return registry ->
        registry
            .addHandler(streamWebSocketHandler, ENDPOINT)
            .addInterceptors(streamHandshakeInterceptor)
            .setAllowedOrigins(allowedOrigins);
  }

  /**
   * Caps incoming messages: the container closes the socket with 1009 above {@value
   * #MAX_INCOMING_MESSAGE_BYTES} bytes. Done on the container found in the servlet context rather
   * than through {@code ServletServerContainerFactoryBean}, which fails the whole context when
   * there is no container (mock servlet environments in tests).
   */
  @Bean
  public ServletContextAware streamMessageSizeLimit() {
    return StreamInvalidationConfig::capIncomingMessageSize;
  }

  static void capIncomingMessageSize(ServletContext servletContext) {
    if (servletContext.getAttribute(ServerContainer.class.getName())
        instanceof ServerContainer container) {
      container.setDefaultMaxTextMessageBufferSize(MAX_INCOMING_MESSAGE_BYTES);
      container.setDefaultMaxBinaryMessageBufferSize(MAX_INCOMING_MESSAGE_BYTES);
    }
  }

  static Set<String> allowedOrigins(String baseUrl, List<String> extraAllowedOrigins) {
    Set<String> origins = new LinkedHashSet<>();
    if (StringUtils.hasText(baseUrl)) {
      UriComponents uri = UriComponentsBuilder.fromUriString(baseUrl).build();
      if (uri.getScheme() != null && uri.getHost() != null) {
        origins.add(
            uri.getScheme()
                + "://"
                + uri.getHost()
                + (uri.getPort() >= 0 ? ":" + uri.getPort() : ""));
      }
    }
    extraAllowedOrigins.stream()
        .map(String::strip)
        .filter(StringUtils::hasText)
        .forEach(origins::add);
    return origins;
  }
}
