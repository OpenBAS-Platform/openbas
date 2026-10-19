package io.openaev.stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
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
import io.openaev.service.AssetGroupService;
import io.openaev.service.AssetService;
import io.openaev.service.PermissionService;
import io.openaev.service.TeamService;
import io.openaev.service.UserService;
import io.openaev.service.credential.CredentialService;
import io.openaev.service.organization.OrganizationService;
import io.openaev.service.scenario.ScenarioService;
import io.openaev.utils.RequestUtils;
import jakarta.websocket.server.ServerContainer;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.boot.test.context.runner.WebApplicationContextRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.mock.web.MockServletContext;
import org.springframework.session.MapSessionRepository;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.handler.SimpleUrlHandlerMapping;

@DisplayName("StreamInvalidationConfig: the preview feature gates the whole stream")
class StreamInvalidationConfigTest {

  private final WebApplicationContextRunner runner =
      new WebApplicationContextRunner()
          .withInitializer(StreamInvalidationConfigTest::registerCollaborators)
          .withUserConfiguration(StreamInvalidationConfig.class);

  private static List<String> streamBeans(ApplicationContext context) {
    return Arrays.stream(context.getBeanDefinitionNames())
        .filter(
            name -> {
              Class<?> type = context.getType(name);
              return type != null && type.getName().startsWith("io.openaev.stream.");
            })
        .toList();
  }

  @Test
  @DisplayName("with the feature off, no bean of the package exists and no endpoint is mapped")
  void given_featureOff_should_registerNothing() {
    runner
        .withPropertyValues("openaev.enabled-dev-features=MARKING")
        .run(
            context -> {
              assertThat(context).hasNotFailed();
              assertThat(streamBeans(context)).isEmpty();
              assertThat(context).doesNotHaveBean("webSocketHandlerMapping");
            });
  }

  @Test
  @DisplayName("with the feature on, the endpoint, listener, buffer and heartbeat exist")
  void given_featureOn_should_registerTheStream() {
    runner
        .withPropertyValues(
            "openaev.enabled-dev-features=STREAM_INVALIDATION",
            "openaev.stream.allowed-origins=http://localhost:3001")
        .run(
            context -> {
              assertThat(context).hasNotFailed();
              assertThat(context)
                  .hasSingleBean(StreamWebSocketHandler.class)
                  .hasSingleBean(StreamHandshakeInterceptor.class)
                  .hasSingleBean(StreamInvalidationListener.class)
                  .hasSingleBean(StreamInvalidationBuffer.class)
                  .hasSingleBean(StreamHeartbeat.class)
                  .hasSingleBean(StreamConnectionRegistry.class);
              HandlerMapping mapping =
                  context.getBean("webSocketHandlerMapping", HandlerMapping.class);
              assertThat(((SimpleUrlHandlerMapping) mapping).getUrlMap())
                  .containsOnlyKeys(StreamInvalidationConfig.ENDPOINT);
            });
  }

  @Test
  @DisplayName("allowed origins are the base URL's origin plus the configured extras")
  void given_baseUrlAndExtras_should_allowTheirOrigins() {
    assertThat(
            StreamInvalidationConfig.allowedOrigins(
                "https://aev.example.com:8443/some/path/", List.of(" http://localhost:3001 ", "")))
        .containsExactly("https://aev.example.com:8443", "http://localhost:3001");
    assertThat(StreamInvalidationConfig.allowedOrigins("http://localhost:8080", List.of()))
        .containsExactly("http://localhost:8080");
    assertThat(StreamInvalidationConfig.allowedOrigins(null, List.of())).isEmpty();
  }

  @Test
  @DisplayName("incoming messages are capped at 16 KB on the servlet container")
  void given_container_should_capIncomingMessages() {
    MockServletContext servletContext = new MockServletContext();
    ServerContainer container = mock(ServerContainer.class);
    servletContext.setAttribute(ServerContainer.class.getName(), container);

    StreamInvalidationConfig.capIncomingMessageSize(servletContext);

    verify(container).setDefaultMaxTextMessageBufferSize(16 * 1024);
    verify(container).setDefaultMaxBinaryMessageBufferSize(16 * 1024);
  }

  /**
   * Registers the collaborators as ready-made singletons: mocks of JPA-backed services must not go
   * through the persistence injection a bean definition would get.
   */
  private static void registerCollaborators(ConfigurableApplicationContext context) {
    OpenAEVConfig openAEVConfig = mock(OpenAEVConfig.class);
    when(openAEVConfig.getBaseUrl()).thenReturn("http://localhost:8080");
    ConfigurableListableBeanFactory beanFactory = context.getBeanFactory();
    beanFactory.registerSingleton("meterRegistry", new SimpleMeterRegistry());
    beanFactory.registerSingleton("userService", mock(UserService.class));
    beanFactory.registerSingleton("permissionService", mock(PermissionService.class));
    beanFactory.registerSingleton("injectService", mock(InjectService.class));
    beanFactory.registerSingleton("scenarioService", mock(ScenarioService.class));
    beanFactory.registerSingleton("exerciseService", mock(ExerciseService.class));
    beanFactory.registerSingleton("assetService", mock(AssetService.class));
    beanFactory.registerSingleton("assetGroupService", mock(AssetGroupService.class));
    beanFactory.registerSingleton("findingService", mock(FindingService.class));
    beanFactory.registerSingleton("teamService", mock(TeamService.class));
    beanFactory.registerSingleton("organizationService", mock(OrganizationService.class));
    beanFactory.registerSingleton("injectorContractService", mock(InjectorContractService.class));
    beanFactory.registerSingleton("credentialService", mock(CredentialService.class));
    beanFactory.registerSingleton("customDashboardService", mock(CustomDashboardService.class));
    beanFactory.registerSingleton("reportingService", mock(ReportingService.class));
    beanFactory.registerSingleton(
        "tenantMembershipCacheManager", mock(TenantMembershipCacheManager.class));
    beanFactory.registerSingleton("tenantUriUtils", new TenantUriUtils(new RequestUtils()));
    beanFactory.registerSingleton("tenantScopedTransaction", mock(TenantScopedTransaction.class));
    beanFactory.registerSingleton(
        "sessionRepository", new MapSessionRepository(new ConcurrentHashMap<>()));
    beanFactory.registerSingleton("openAEVConfig", openAEVConfig);
  }
}
