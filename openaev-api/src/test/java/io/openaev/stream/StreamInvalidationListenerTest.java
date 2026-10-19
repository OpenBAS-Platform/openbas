package io.openaev.stream;

import static io.openaev.database.audit.ModelBaseListener.DATA_DELETE;
import static io.openaev.database.audit.ModelBaseListener.DATA_PERSIST;
import static io.openaev.database.audit.ModelBaseListener.DATA_UPDATE;
import static io.openaev.stream.StreamConnectionRegistryTest.connection;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.withSettings;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import io.openaev.context.BulkOperationContext;
import io.openaev.context.TenantContext;
import io.openaev.database.audit.AnalyticsIndexedEvent;
import io.openaev.database.audit.BaseEvent;
import io.openaev.database.audit.FindingWrittenEvent;
import io.openaev.database.audit.IndexEvent;
import io.openaev.database.model.Agent;
import io.openaev.database.model.Article;
import io.openaev.database.model.Asset;
import io.openaev.database.model.AssetGroup;
import io.openaev.database.model.Base;
import io.openaev.database.model.CatalogConnector;
import io.openaev.database.model.Challenge;
import io.openaev.database.model.ChallengeFlag;
import io.openaev.database.model.Channel;
import io.openaev.database.model.Collector;
import io.openaev.database.model.Comcheck;
import io.openaev.database.model.ComcheckStatus;
import io.openaev.database.model.Command;
import io.openaev.database.model.Communication;
import io.openaev.database.model.ConnectorInstanceConfiguration;
import io.openaev.database.model.ConnectorInstanceLog;
import io.openaev.database.model.ConnectorInstancePersisted;
import io.openaev.database.model.CredentialSecretReference;
import io.openaev.database.model.CustomDashboard;
import io.openaev.database.model.CustomDashboardParameters;
import io.openaev.database.model.DetectionInjectExpectation;
import io.openaev.database.model.DetectionRemediation;
import io.openaev.database.model.Document;
import io.openaev.database.model.Endpoint;
import io.openaev.database.model.Evaluation;
import io.openaev.database.model.Executor;
import io.openaev.database.model.Exercise;
import io.openaev.database.model.Finding;
import io.openaev.database.model.Inject;
import io.openaev.database.model.Injector;
import io.openaev.database.model.InjectorContract;
import io.openaev.database.model.LessonsAnswer;
import io.openaev.database.model.LessonsCategory;
import io.openaev.database.model.LessonsQuestion;
import io.openaev.database.model.LessonsTemplate;
import io.openaev.database.model.LessonsTemplateCategory;
import io.openaev.database.model.LessonsTemplateQuestion;
import io.openaev.database.model.Log;
import io.openaev.database.model.ManualInjectExpectation;
import io.openaev.database.model.Objective;
import io.openaev.database.model.Organization;
import io.openaev.database.model.Payload;
import io.openaev.database.model.PhishingEmailTemplate;
import io.openaev.database.model.PhishingLandingPage;
import io.openaev.database.model.Reporting;
import io.openaev.database.model.ReportingGeneration;
import io.openaev.database.model.ReportingSchedule;
import io.openaev.database.model.Scenario;
import io.openaev.database.model.SecurityPlatform;
import io.openaev.database.model.Team;
import io.openaev.database.model.Tenant;
import io.openaev.database.model.User;
import io.openaev.database.model.Variable;
import io.openaev.database.model.Widget;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.IntStream;
import org.hibernate.collection.spi.PersistentCollection;
import org.hibernate.proxy.HibernateProxy;
import org.hibernate.proxy.LazyInitializer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.web.socket.TextMessage;

@DisplayName("StreamInvalidationListener: from a committed change to its topics")
class StreamInvalidationListenerTest {

  private static final String TENANT_A = "tenant-a";
  private static final String TENANT_B = "tenant-b";
  private static final TextMessage INVALIDATE =
      new TextMessage(StreamMessages.invalidate(StreamTopic.LIST_SCENARIOS));

  private static final List<Object> proxies = new ArrayList<>();

  private final ObjectMapper mapper = mock(ObjectMapper.class);
  private SimpleMeterRegistry meterRegistry;
  private StreamConnectionRegistry registry;
  private MutableClock clock;
  private StreamInvalidationBuffer buffer;
  private StreamInvalidationListener listener;
  private StreamConnection socketA;
  private StreamConnection socketB;

  @BeforeEach
  void setUp() {
    proxies.clear();
    meterRegistry = new SimpleMeterRegistry();
    StreamMetrics metrics = new StreamMetrics(meterRegistry);
    registry = new StreamConnectionRegistry(metrics);
    clock = new MutableClock(Instant.parse("2026-10-07T10:00:00Z"));
    buffer = new StreamInvalidationBuffer(registry, metrics, clock);
    listener = new StreamInvalidationListener(buffer, metrics);
    socketA = subscribed("a", TENANT_A);
    socketB = subscribed("b", TENANT_B);
  }

  private StreamConnection subscribed(String id, String tenantId) {
    StreamConnection socket = connection(id, tenantId);
    registry.register(socket);
    registry.replaceTopics(socket, Set.of(StreamTopic.LIST_SCENARIOS));
    return socket;
  }

  private static Scenario scenario(String tenantId) {
    Scenario scenario = new Scenario();
    scenario.setId(UUID.randomUUID().toString());
    scenario.setName("scenario");
    scenario.setTenant(new Tenant(tenantId));
    return scenario;
  }

  private BaseEvent event(String type, Base instance) {
    BaseEvent event = new BaseEvent(type, instance, mapper);
    // Building the event reads the id of the parents' proxies to resolve its permission resource,
    // like the real listener chain does: only what the stream listener reads afterwards counts.
    clearInvocations(proxies.toArray());
    return event;
  }

  @ParameterizedTest
  @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
  @DisplayName("a scenario change reaches its own tenant's list:scenarios, never another's")
  void given_scenarioChange_should_invalidateOwnTenantOnly(String type) throws IOException {
    // Act
    listener.onDatabaseUpdate(event(type, scenario(TENANT_A)));
    buffer.drain();

    // Assert
    verify(socketA.session()).sendMessage(INVALIDATE);
    verify(socketB.session(), never()).sendMessage(any());
  }

  @Test
  @DisplayName("a bulk delete produces one invalidation per interval, despite the SSE suppression")
  void given_bulkDelete_should_invalidateOncePerInterval() throws IOException {
    // Arrange: per-entity events of a bulk are built inside BulkOperationContext
    List<BaseEvent> events =
        BulkOperationContext.runSuppressed(
            () ->
                IntStream.range(0, 50)
                    .mapToObj(i -> event(DATA_DELETE, scenario(TENANT_A)))
                    .toList());
    assertThat(events).allMatch(e -> !e.isListened());

    // Act: the first chunk commits, then the rest a moment later
    events.subList(0, 25).forEach(listener::onDatabaseUpdate);
    buffer.drain();
    clock.advance(Duration.ofMillis(300));
    events.subList(25, 50).forEach(listener::onDatabaseUpdate);
    buffer.drain();

    // Assert
    verify(socketA.session(), times(1)).sendMessage(INVALIDATE);

    clock.advance(Duration.ofSeconds(2));
    buffer.drain();
    verify(socketA.session(), times(2)).sendMessage(INVALIDATE);
    verify(socketB.session(), never()).sendMessage(any());
  }

  @Test
  @DisplayName("a creation with injector contracts produces one invalidation per interval")
  void given_creationWithInjectorContracts_should_invalidateOnce() throws IOException {
    // Arrange: the scenario is persisted, then saved again as each inject is attached
    Scenario scenario = scenario(TENANT_A);

    // Act
    listener.onDatabaseUpdate(event(DATA_PERSIST, scenario));
    for (int i = 0; i < 5; i++) {
      listener.onDatabaseUpdate(event(DATA_UPDATE, scenario));
    }
    buffer.drain();
    buffer.drain();

    // Assert
    verify(socketA.session(), times(1)).sendMessage(INVALIDATE);
  }

  @Test
  @DisplayName("a simulation or a simulation's inject does not reach list:scenarios")
  void given_otherEntity_should_produceNothing() throws IOException {
    // Arrange
    Exercise simulation = new Exercise();
    simulation.setId(UUID.randomUUID().toString());
    simulation.setTenant(new Tenant(TENANT_A));
    Inject inject = atomicTesting(TENANT_A);
    inject.setExercise(simulation);

    // Act
    listener.onDatabaseUpdate(event(DATA_UPDATE, simulation));
    listener.onDatabaseUpdate(event(DATA_UPDATE, inject));
    buffer.drain();

    // Assert
    verify(socketA.session(), never()).sendMessage(any());
    verify(socketB.session(), never()).sendMessage(any());
  }

  @Test
  @DisplayName("a scenario without a readable tenant records nothing")
  void given_scenarioWithoutTenant_should_recordNothing() throws IOException {
    Scenario scenario = scenario(TENANT_A);
    scenario.setTenant(null);

    listener.onDatabaseUpdate(event(DATA_UPDATE, scenario));
    buffer.drain();

    verify(socketA.session(), never()).sendMessage(any());
    verify(socketB.session(), never()).sendMessage(any());
  }

  @Test
  @DisplayName("a failure inside the listener is counted and goes no further")
  void given_failure_should_beCountedAndSwallowed() {
    // Arrange
    BaseEvent broken = mock(BaseEvent.class);
    Scenario scenario = mock(Scenario.class);
    when(broken.getInstance()).thenReturn(scenario);
    when(scenario.isListened()).thenReturn(true);
    when(scenario.getTenant()).thenThrow(new IllegalStateException("detached"));

    // Act & Assert
    assertThatCode(() -> listener.onDatabaseUpdate(broken)).doesNotThrowAnyException();
    assertThat(meterRegistry.get("openaev.stream.ws.listener.failures").counter().count())
        .isEqualTo(1);
  }

  private static Inject atomicTesting(String tenantId) {
    Inject inject = new Inject();
    inject.setId(UUID.randomUUID().toString());
    inject.setTitle("atomic testing");
    inject.setTenant(new Tenant(tenantId));
    return inject;
  }

  /** An uninitialized Hibernate proxy: only its id may be read. */
  private static <T> T proxy(Class<T> type, String id) {
    T proxy = mock(type, withSettings().extraInterfaces(HibernateProxy.class));
    proxies.add(proxy);
    LazyInitializer initializer = mock(LazyInitializer.class);
    when(initializer.getIdentifier()).thenReturn(id);
    when(initializer.isUninitialized()).thenReturn(true);
    when(((HibernateProxy) proxy).getHibernateLazyInitializer()).thenReturn(initializer);
    when(((HibernateProxy) proxy).asHibernateProxy()).thenReturn((HibernateProxy) proxy);
    return proxy;
  }

  @Nested
  @DisplayName("atomic testings: list:atomic-testings and atomic-testing:<id>")
  class AtomicTestings {

    private Inject inject;
    private StreamTopic detail;
    private TextMessage invalidateList;
    private TextMessage invalidateDetail;
    private StreamConnection listWatcherA;
    private StreamConnection detailWatcherA;
    private StreamConnection listWatcherB;

    @BeforeEach
    void setUp() {
      inject = atomicTesting(TENANT_A);
      detail = StreamTopic.atomicTesting(inject.getId());
      invalidateList = new TextMessage(StreamMessages.invalidate(StreamTopic.LIST_ATOMIC_TESTINGS));
      invalidateDetail = new TextMessage(StreamMessages.invalidate(detail));
      listWatcherA = watching("list-a", TENANT_A, StreamTopic.LIST_ATOMIC_TESTINGS);
      detailWatcherA = watching("detail-a", TENANT_A, detail);
      listWatcherB = watching("list-b", TENANT_B, StreamTopic.LIST_ATOMIC_TESTINGS);
    }

    @AfterEach
    void tearDown() {
      TenantContext.clearCurrentTenant();
    }

    private StreamConnection watching(String id, String tenantId, StreamTopic topic) {
      StreamConnection socket = connection(id, tenantId);
      registry.register(socket);
      registry.replaceTopics(socket, Set.of(topic));
      return socket;
    }

    private void assertListAndDetailOfTenantA() throws IOException {
      verify(listWatcherA.session()).sendMessage(invalidateList);
      verify(detailWatcherA.session()).sendMessage(invalidateDetail);
      verify(listWatcherB.session(), never()).sendMessage(any());
      verify(socketA.session(), never()).sendMessage(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
    @DisplayName("an atomic testing change reaches its list and its screen, in its tenant only")
    void given_atomicTestingChange_should_invalidateListAndDetail(String type) throws IOException {
      listener.onDatabaseUpdate(event(type, inject));
      buffer.drain();

      assertListAndDetailOfTenantA();
    }

    @Test
    @DisplayName("an unlistened inject (an import) produces nothing")
    void given_unlistenedInject_should_produceNothing() throws IOException {
      inject.setListened(false);

      listener.onDatabaseUpdate(event(DATA_UPDATE, inject));
      buffer.drain();

      verify(listWatcherA.session(), never()).sendMessage(any());
      verify(detailWatcherA.session(), never()).sendMessage(any());
    }

    @Test
    @DisplayName("a scenario's inject produces nothing")
    void given_scenarioInject_should_produceNothing() throws IOException {
      Scenario scenario = scenario(TENANT_A);
      inject.setScenario(scenario);

      listener.onDatabaseUpdate(event(DATA_UPDATE, inject));
      buffer.drain();

      verify(listWatcherA.session(), never()).sendMessage(any());
      verify(detailWatcherA.session(), never()).sendMessage(any());
    }

    @Test
    @DisplayName("an expectation whose inject is loaded reaches the list and the screen")
    void given_expectationWithLoadedInject_should_invalidateListAndDetail() throws IOException {
      ManualInjectExpectation expectation = new ManualInjectExpectation();
      expectation.setId(UUID.randomUUID().toString());
      expectation.setInject(inject);

      listener.onDatabaseUpdate(event(DATA_UPDATE, expectation));
      buffer.drain();

      assertListAndDetailOfTenantA();
    }

    @Test
    @DisplayName("an expectation whose inject is a proxy reads only its id and the thread tenant")
    void given_expectationWithInjectProxy_should_notLoadIt() throws IOException {
      // Arrange
      Inject injectProxy = proxy(Inject.class, inject.getId());
      ManualInjectExpectation expectation = new ManualInjectExpectation();
      expectation.setId(UUID.randomUUID().toString());
      expectation.setInject(injectProxy);
      TenantContext.setCurrentTenant(TENANT_A);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, expectation));
      buffer.drain();

      // Assert
      assertListAndDetailOfTenantA();
      verify(injectProxy, never()).getTenant();
      verify(injectProxy, never()).isAtomicTesting();
      verify(injectProxy, never()).getId();
    }

    @Test
    @DisplayName("without a thread tenant, a proxied expectation still reaches the screen")
    void given_expectationWithInjectProxyAndNoTenant_should_invalidateDetailOnly()
        throws IOException {
      ManualInjectExpectation expectation = new ManualInjectExpectation();
      expectation.setId(UUID.randomUUID().toString());
      expectation.setInject(proxy(Inject.class, inject.getId()));

      listener.onDatabaseUpdate(event(DATA_UPDATE, expectation));
      buffer.drain();

      verify(detailWatcherA.session()).sendMessage(invalidateDetail);
      verify(listWatcherA.session(), never()).sendMessage(any());
    }

    @Test
    @DisplayName("a simulation's expectation does not reach atomic testings")
    void given_simulationExpectation_should_produceNothing() throws IOException {
      ManualInjectExpectation expectation = new ManualInjectExpectation();
      expectation.setId(UUID.randomUUID().toString());
      expectation.setInject(proxy(Inject.class, inject.getId()));
      expectation.setExercise(proxy(Exercise.class, UUID.randomUUID().toString()));
      TenantContext.setCurrentTenant(TENANT_A);

      listener.onDatabaseUpdate(event(DATA_UPDATE, expectation));
      buffer.drain();

      verify(listWatcherA.session(), never()).sendMessage(any());
      verify(detailWatcherA.session(), never()).sendMessage(any());
    }

    @Test
    @DisplayName("a finding reaches the screen of its atomic testing, not the list")
    void given_finding_should_invalidateDetailOnly() throws IOException {
      Finding finding = new Finding();
      finding.setId(UUID.randomUUID().toString());
      finding.setTenant(new Tenant(TENANT_A));
      finding.setInject(proxy(Inject.class, inject.getId()));

      listener.onDatabaseUpdate(event(DATA_PERSIST, finding));
      buffer.drain();

      verify(detailWatcherA.session()).sendMessage(invalidateDetail);
      verify(listWatcherA.session(), never()).sendMessage(any());
    }

    @Test
    @DisplayName("a native delete announced by an index event reaches a watched screen")
    void given_indexDelete_should_invalidateWatchedDetail() throws IOException {
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, inject.getId()));
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, UUID.randomUUID().toString()));
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, "not-an-inject-id"));
      buffer.drain();

      verify(detailWatcherA.session()).sendMessage(invalidateDetail);
      verify(listWatcherA.session(), never()).sendMessage(any());
      assertThat(meterRegistry.get("openaev.stream.ws.listener.failures").counter().count())
          .isZero();
    }

    @Test
    @DisplayName("a burst of expectation updates sends one message per topic and interval")
    void given_expectationBurst_should_invalidateOncePerInterval() throws IOException {
      for (int i = 0; i < 20; i++) {
        ManualInjectExpectation expectation = new ManualInjectExpectation();
        expectation.setId(UUID.randomUUID().toString());
        expectation.setInject(inject);
        listener.onDatabaseUpdate(event(DATA_UPDATE, expectation));
      }
      buffer.drain();
      buffer.drain();

      verify(listWatcherA.session(), times(1)).sendMessage(invalidateList);
      verify(detailWatcherA.session(), times(1)).sendMessage(invalidateDetail);
    }
  }

  @Nested
  @DisplayName("a scenario's screen: scenario:<id>")
  class ScenarioDetail {

    private String scenarioId;
    private TextMessage invalidateDetail;
    private StreamConnection detailWatcherA;

    @BeforeEach
    void setUp() {
      scenarioId = UUID.randomUUID().toString();
      invalidateDetail =
          new TextMessage(StreamMessages.invalidate(StreamTopic.scenario(scenarioId)));
      detailWatcherA = connection("scenario-a", TENANT_A);
      registry.register(detailWatcherA);
      registry.replaceTopics(detailWatcherA, Set.of(StreamTopic.scenario(scenarioId)));
    }

    private void assertDetailInvalidated() throws IOException {
      buffer.drain();
      verify(detailWatcherA.session()).sendMessage(invalidateDetail);
      verify(socketB.session(), never()).sendMessage(any());
    }

    private void assertNothingSent() throws IOException {
      buffer.drain();
      verify(detailWatcherA.session(), never()).sendMessage(any());
      verify(socketA.session(), never()).sendMessage(any());
      assertThat(meterRegistry.get("openaev.stream.ws.listener.failures").counter().count())
          .isZero();
    }

    /** A scenario proxy whose only readable fact is its id, which must come from the proxy. */
    private Scenario scenarioProxy() {
      return proxy(Scenario.class, scenarioId);
    }

    private static void assertNotLoaded(Scenario scenarioProxy) {
      verify(scenarioProxy, never()).getId();
      verify(scenarioProxy, never()).getTenant();
      verify(scenarioProxy, never()).getName();
    }

    private Exercise simulationOf(Scenario scenario) {
      Exercise simulation = new Exercise();
      simulation.setId(UUID.randomUUID().toString());
      simulation.setTenant(new Tenant(TENANT_A));
      simulation.setScenario(scenario);
      return simulation;
    }

    @ParameterizedTest
    @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
    @DisplayName("a scenario change reaches its screen and its tenant's list")
    void given_scenarioChange_should_invalidateDetailAndList(String type) throws IOException {
      // Arrange
      Scenario scenario = scenario(TENANT_A);
      scenario.setId(scenarioId);

      // Act
      listener.onDatabaseUpdate(event(type, scenario));

      // Assert
      assertDetailInvalidated();
      verify(socketA.session()).sendMessage(INVALIDATE);
    }

    @Test
    @DisplayName("a scenario's inject reaches the screen, reading the scenario id from its proxy")
    void given_scenarioInject_should_invalidateDetail() throws IOException {
      // Arrange
      Scenario scenarioProxy = scenarioProxy();
      Inject inject = atomicTesting(TENANT_A);
      inject.setScenario(scenarioProxy);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, inject));

      // Assert
      assertDetailInvalidated();
      assertNotLoaded(scenarioProxy);
    }

    @Test
    @DisplayName("a simulation of the scenario reaches the screen without loading the scenario")
    void given_simulationOfScenario_should_invalidateDetail() throws IOException {
      Scenario scenarioProxy = scenarioProxy();

      listener.onDatabaseUpdate(event(DATA_UPDATE, simulationOf(scenarioProxy)));

      assertDetailInvalidated();
      assertNotLoaded(scenarioProxy);
    }

    @Test
    @DisplayName("a simulation created from no scenario produces nothing")
    void given_simulationWithoutScenario_should_produceNothing() throws IOException {
      listener.onDatabaseUpdate(event(DATA_UPDATE, simulationOf(null)));

      assertNothingSent();
    }

    @Test
    @DisplayName("an inject of a simulation of the scenario reaches the screen (execution tab)")
    void given_simulationInject_should_invalidateDetail() throws IOException {
      // Arrange
      Scenario scenarioProxy = scenarioProxy();
      Inject inject = atomicTesting(TENANT_A);
      inject.setExercise(simulationOf(scenarioProxy));

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, inject));

      // Assert
      assertDetailInvalidated();
      assertNotLoaded(scenarioProxy);
    }

    @Test
    @DisplayName("an inject whose simulation is a proxy produces nothing and loads nothing")
    void given_simulationInjectWithSimulationProxy_should_produceNothing() throws IOException {
      // Arrange
      Exercise simulationProxy = proxy(Exercise.class, UUID.randomUUID().toString());
      Inject inject = atomicTesting(TENANT_A);
      inject.setExercise(simulationProxy);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, inject));

      // Assert
      assertNothingSent();
      verify(simulationProxy, never()).getScenario();
    }

    @Test
    @DisplayName("a finding of a loaded simulation inject reaches the screen (findings tab)")
    void given_findingOfSimulationInject_should_invalidateDetail() throws IOException {
      // Arrange
      Scenario scenarioProxy = scenarioProxy();
      Inject inject = atomicTesting(TENANT_A);
      inject.setExercise(simulationOf(scenarioProxy));
      Finding finding = new Finding();
      finding.setId(UUID.randomUUID().toString());
      finding.setTenant(new Tenant(TENANT_A));
      finding.setInject(inject);

      // Act
      listener.onDatabaseUpdate(event(DATA_PERSIST, finding));

      // Assert
      assertDetailInvalidated();
      assertNotLoaded(scenarioProxy);
    }

    @Test
    @DisplayName("a scenario's article, variable, objective and lessons category reach the screen")
    void given_scenarioChildren_should_invalidateDetail() throws IOException {
      // Arrange
      Scenario scenarioProxy = scenarioProxy();
      Article article = new Article();
      article.setId(UUID.randomUUID().toString());
      article.setScenario(scenarioProxy);
      Variable variable = new Variable();
      variable.setId(UUID.randomUUID().toString());
      variable.setScenario(scenarioProxy);
      Objective objective = new Objective();
      objective.setId(UUID.randomUUID().toString());
      objective.setScenario(scenarioProxy);
      LessonsCategory category = new LessonsCategory();
      category.setId(UUID.randomUUID().toString());
      category.setScenario(scenarioProxy);

      // Act
      for (Base child : List.<Base>of(article, variable, objective, category)) {
        listener.onDatabaseUpdate(event(DATA_UPDATE, child));
        buffer.drain();
        clock.advance(Duration.ofSeconds(2));
      }

      // Assert
      verify(detailWatcherA.session(), times(4)).sendMessage(invalidateDetail);
      assertNotLoaded(scenarioProxy);
    }

    @Test
    @DisplayName("a simulation's article does not reach the scenario's screen")
    void given_simulationArticle_should_produceNothing() throws IOException {
      Article article = new Article();
      article.setId(UUID.randomUUID().toString());
      article.setExercise(proxy(Exercise.class, UUID.randomUUID().toString()));

      listener.onDatabaseUpdate(event(DATA_UPDATE, article));

      assertNothingSent();
    }

    @Test
    @DisplayName("a lessons question reaches the screen through its loaded category only")
    void given_lessonsQuestion_should_readLoadedCategoryOnly() throws IOException {
      // Arrange
      LessonsCategory category = new LessonsCategory();
      category.setId(UUID.randomUUID().toString());
      category.setScenario(scenarioProxy());
      LessonsQuestion question = new LessonsQuestion();
      question.setId(UUID.randomUUID().toString());
      question.setCategory(category);
      LessonsCategory categoryProxy = proxy(LessonsCategory.class, UUID.randomUUID().toString());
      LessonsQuestion orphan = new LessonsQuestion();
      orphan.setId(UUID.randomUUID().toString());
      orphan.setCategory(categoryProxy);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, question));
      listener.onDatabaseUpdate(event(DATA_UPDATE, orphan));

      // Assert
      assertDetailInvalidated();
      verify(categoryProxy, never()).getScenario();
    }

    @Test
    @DisplayName("a team or document reaches the screens of its loaded scenarios")
    void given_teamAndDocumentWithLoadedScenarios_should_invalidateDetail() throws IOException {
      // Arrange
      Scenario scenarioProxy = scenarioProxy();
      Team team = new Team();
      team.setId(UUID.randomUUID().toString());
      team.setScenarios(new HashSet<>(Set.of(scenarioProxy)));
      Document document = new Document();
      document.setId(UUID.randomUUID().toString());
      document.setScenarios(new HashSet<>(Set.of(scenarioProxy)));

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, team));
      buffer.drain();
      clock.advance(Duration.ofSeconds(2));
      listener.onDatabaseUpdate(event(DATA_UPDATE, document));
      buffer.drain();

      // Assert
      verify(detailWatcherA.session(), times(2)).sendMessage(invalidateDetail);
      assertNotLoaded(scenarioProxy);
    }

    @Test
    @DisplayName("a team whose scenarios are not loaded produces nothing and loads nothing")
    @SuppressWarnings("unchecked")
    void given_teamWithLazyScenarios_should_produceNothing() throws IOException {
      // Arrange
      Set<Scenario> lazyScenarios =
          mock(Set.class, withSettings().extraInterfaces(PersistentCollection.class));
      when(((PersistentCollection<?>) lazyScenarios).wasInitialized()).thenReturn(false);
      Team team = new Team();
      team.setId(UUID.randomUUID().toString());
      team.setScenarios(lazyScenarios);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, team));

      // Assert
      assertNothingSent();
      verify(lazyScenarios, never()).iterator();
    }

    @Test
    @DisplayName("an uninitialized proxy as the event's entity is skipped without loading")
    void given_proxyInstance_should_produceNothing() throws IOException {
      // Arrange
      BaseEvent proxied = mock(BaseEvent.class);
      Article articleProxy = proxy(Article.class, UUID.randomUUID().toString());
      when(proxied.getInstance()).thenReturn(articleProxy);

      // Act
      listener.onDatabaseUpdate(proxied);

      // Assert
      assertNothingSent();
      verify(articleProxy, never()).isListened();
      verify(articleProxy, never()).getScenario();
    }

    @Test
    @DisplayName("a native scenario delete announced by an index event reaches its screen")
    void given_indexDelete_should_invalidateWatchedScenario() throws IOException {
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, scenarioId));

      assertDetailInvalidated();
    }
  }

  @Nested
  @DisplayName("simulations: list:simulations and simulation:<id>")
  class SimulationDetail {

    private String simulationId;
    private TextMessage invalidateList;
    private TextMessage invalidateDetail;
    private StreamConnection listWatcherA;
    private StreamConnection detailWatcherA;
    private StreamConnection listWatcherB;

    @BeforeEach
    void setUp() {
      simulationId = UUID.randomUUID().toString();
      StreamTopic detail = StreamTopic.simulation(simulationId);
      invalidateList = new TextMessage(StreamMessages.invalidate(StreamTopic.LIST_SIMULATIONS));
      invalidateDetail = new TextMessage(StreamMessages.invalidate(detail));
      listWatcherA = watching("list-a", TENANT_A, StreamTopic.LIST_SIMULATIONS);
      detailWatcherA = watching("detail-a", TENANT_A, detail);
      listWatcherB = watching("list-b", TENANT_B, StreamTopic.LIST_SIMULATIONS);
    }

    @AfterEach
    void tearDown() {
      TenantContext.clearCurrentTenant();
    }

    private StreamConnection watching(String id, String tenantId, StreamTopic topic) {
      StreamConnection socket = connection(id, tenantId);
      registry.register(socket);
      registry.replaceTopics(socket, Set.of(topic));
      return socket;
    }

    private Exercise simulation() {
      Exercise simulation = new Exercise();
      simulation.setId(simulationId);
      simulation.setName("simulation");
      simulation.setTenant(new Tenant(TENANT_A));
      return simulation;
    }

    /** A simulation proxy whose only readable fact is its id, which must come from the proxy. */
    private Exercise simulationProxy() {
      return proxy(Exercise.class, simulationId);
    }

    private static void assertNotLoaded(Exercise simulationProxy) {
      verify(simulationProxy, never()).getId();
      verify(simulationProxy, never()).getTenant();
      verify(simulationProxy, never()).getScenario();
      verify(simulationProxy, never()).getName();
    }

    private void assertListAndDetailOfTenantA() throws IOException {
      buffer.drain();
      verify(listWatcherA.session()).sendMessage(invalidateList);
      verify(detailWatcherA.session()).sendMessage(invalidateDetail);
      verify(listWatcherB.session(), never()).sendMessage(any());
      verify(socketA.session(), never()).sendMessage(any());
    }

    private void assertDetailOnly() throws IOException {
      buffer.drain();
      verify(detailWatcherA.session()).sendMessage(invalidateDetail);
      verify(listWatcherA.session(), never()).sendMessage(any());
      verify(listWatcherB.session(), never()).sendMessage(any());
    }

    private void assertNothingSent() throws IOException {
      buffer.drain();
      verify(detailWatcherA.session(), never()).sendMessage(any());
      verify(listWatcherA.session(), never()).sendMessage(any());
      assertThat(meterRegistry.get("openaev.stream.ws.listener.failures").counter().count())
          .isZero();
    }

    private Inject simulationInject(Exercise simulation) {
      Inject inject = atomicTesting(TENANT_A);
      inject.setExercise(simulation);
      return inject;
    }

    @ParameterizedTest
    @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
    @DisplayName("a simulation change reaches its list and its screen, in its tenant only")
    void given_simulationChange_should_invalidateListAndDetail(String type) throws IOException {
      listener.onDatabaseUpdate(event(type, simulation()));

      assertListAndDetailOfTenantA();
    }

    @Test
    @DisplayName("a simulation without a readable tenant still reaches its screen")
    void given_simulationWithoutTenant_should_invalidateDetailOnly() throws IOException {
      Exercise simulation = simulation();
      simulation.setTenant(null);

      listener.onDatabaseUpdate(event(DATA_UPDATE, simulation));

      assertDetailOnly();
    }

    @Test
    @DisplayName("a simulation's inject (or its status) reaches the list and the screen")
    void given_simulationInject_should_invalidateListAndDetail() throws IOException {
      listener.onDatabaseUpdate(event(DATA_UPDATE, simulationInject(simulation())));

      assertListAndDetailOfTenantA();
    }

    @Test
    @DisplayName("an inject whose simulation is a proxy reads only its id")
    void given_injectWithSimulationProxy_should_notLoadIt() throws IOException {
      // Arrange
      Exercise simulationProxy = simulationProxy();

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, simulationInject(simulationProxy)));

      // Assert
      assertListAndDetailOfTenantA();
      assertNotLoaded(simulationProxy);
    }

    @Test
    @DisplayName("an unlistened simulation inject (an import) produces nothing")
    void given_unlistenedInject_should_produceNothing() throws IOException {
      Inject inject = simulationInject(simulation());
      inject.setListened(false);

      listener.onDatabaseUpdate(event(DATA_UPDATE, inject));

      assertNothingSent();
    }

    @Test
    @DisplayName("an expectation reads the simulation and inject ids from their proxies only")
    void given_expectationWithProxies_should_invalidateListAndDetail() throws IOException {
      // Arrange
      Exercise simulationProxy = simulationProxy();
      Inject injectProxy = proxy(Inject.class, UUID.randomUUID().toString());
      ManualInjectExpectation expectation = new ManualInjectExpectation();
      expectation.setId(UUID.randomUUID().toString());
      expectation.setInject(injectProxy);
      expectation.setExercise(simulationProxy);
      TenantContext.setCurrentTenant(TENANT_A);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, expectation));

      // Assert
      assertListAndDetailOfTenantA();
      assertNotLoaded(simulationProxy);
      verify(injectProxy, never()).getTenant();
      verify(injectProxy, never()).getExercise();
      verify(injectProxy, never()).isAtomicTesting();
    }

    @Test
    @DisplayName("without a thread tenant, a proxied expectation still reaches the screen")
    void given_expectationWithoutTenant_should_invalidateDetailOnly() throws IOException {
      ManualInjectExpectation expectation = new ManualInjectExpectation();
      expectation.setId(UUID.randomUUID().toString());
      expectation.setInject(proxy(Inject.class, UUID.randomUUID().toString()));
      expectation.setExercise(simulationProxy());

      listener.onDatabaseUpdate(event(DATA_UPDATE, expectation));

      assertDetailOnly();
    }

    @Test
    @DisplayName("an expectation without simulation reaches it through its loaded inject")
    void given_expectationWithLoadedSimulationInject_should_invalidateListAndDetail()
        throws IOException {
      ManualInjectExpectation expectation = new ManualInjectExpectation();
      expectation.setId(UUID.randomUUID().toString());
      expectation.setInject(simulationInject(simulationProxy()));

      listener.onDatabaseUpdate(event(DATA_UPDATE, expectation));

      assertListAndDetailOfTenantA();
    }

    @Test
    @DisplayName("a burst of expectation updates sends one message per topic and interval")
    void given_expectationBurst_should_invalidateOncePerInterval() throws IOException {
      TenantContext.setCurrentTenant(TENANT_A);
      for (int i = 0; i < 20; i++) {
        ManualInjectExpectation expectation = new ManualInjectExpectation();
        expectation.setId(UUID.randomUUID().toString());
        expectation.setInject(proxy(Inject.class, UUID.randomUUID().toString()));
        expectation.setExercise(simulationProxy());
        listener.onDatabaseUpdate(event(DATA_UPDATE, expectation));
      }
      buffer.drain();
      buffer.drain();

      verify(listWatcherA.session(), times(1)).sendMessage(invalidateList);
      verify(detailWatcherA.session(), times(1)).sendMessage(invalidateDetail);
    }

    @Test
    @DisplayName("a finding of a loaded simulation inject reaches the screen, not the list")
    void given_findingOfSimulationInject_should_invalidateDetailOnly() throws IOException {
      // Arrange
      Exercise simulationProxy = simulationProxy();
      Finding finding = new Finding();
      finding.setId(UUID.randomUUID().toString());
      finding.setTenant(new Tenant(TENANT_A));
      finding.setInject(simulationInject(simulationProxy));

      // Act
      listener.onDatabaseUpdate(event(DATA_PERSIST, finding));

      // Assert
      assertDetailOnly();
      assertNotLoaded(simulationProxy);
    }

    @Test
    @DisplayName("a finding whose inject is a proxy does not reach the simulation")
    void given_findingWithInjectProxy_should_produceNothing() throws IOException {
      Inject injectProxy = proxy(Inject.class, UUID.randomUUID().toString());
      Finding finding = new Finding();
      finding.setId(UUID.randomUUID().toString());
      finding.setTenant(new Tenant(TENANT_A));
      finding.setInject(injectProxy);

      listener.onDatabaseUpdate(event(DATA_PERSIST, finding));

      assertNothingSent();
      verify(injectProxy, never()).getExercise();
    }

    @Test
    @DisplayName("a simulation's direct children reach the screen, reading the id from the proxy")
    void given_simulationChildren_should_invalidateDetail() throws IOException {
      // Arrange
      Exercise simulationProxy = simulationProxy();
      Article article = new Article();
      article.setId(UUID.randomUUID().toString());
      article.setExercise(simulationProxy);
      Variable variable = new Variable();
      variable.setId(UUID.randomUUID().toString());
      variable.setExercise(simulationProxy);
      Objective objective = new Objective();
      objective.setId(UUID.randomUUID().toString());
      objective.setExercise(simulationProxy);
      LessonsCategory category = new LessonsCategory();
      category.setId(UUID.randomUUID().toString());
      category.setExercise(simulationProxy);
      Log log = new Log();
      log.setId(UUID.randomUUID().toString());
      log.setExercise(simulationProxy);
      Comcheck comcheck = new Comcheck();
      comcheck.setId(UUID.randomUUID().toString());
      comcheck.setExercise(simulationProxy);
      List<Base> children = List.of(article, variable, objective, category, log, comcheck);

      // Act
      for (Base child : children) {
        listener.onDatabaseUpdate(event(DATA_UPDATE, child));
        buffer.drain();
        clock.advance(Duration.ofSeconds(2));
      }

      // Assert
      verify(detailWatcherA.session(), times(children.size())).sendMessage(invalidateDetail);
      verify(listWatcherA.session(), never()).sendMessage(any());
      assertNotLoaded(simulationProxy);
    }

    @Test
    @DisplayName("grandchildren reach the screen through loaded parents only")
    void given_grandchildrenWithLoadedParents_should_invalidateDetail() throws IOException {
      // Arrange
      Exercise simulationProxy = simulationProxy();
      LessonsCategory category = new LessonsCategory();
      category.setId(UUID.randomUUID().toString());
      category.setExercise(simulationProxy);
      LessonsQuestion question = new LessonsQuestion();
      question.setId(UUID.randomUUID().toString());
      question.setCategory(category);
      LessonsAnswer answer = new LessonsAnswer();
      answer.setId(UUID.randomUUID().toString());
      answer.setQuestion(question);
      Objective objective = new Objective();
      objective.setId(UUID.randomUUID().toString());
      objective.setExercise(simulationProxy);
      Evaluation evaluation = new Evaluation();
      evaluation.setId(UUID.randomUUID().toString());
      evaluation.setObjective(objective);
      Comcheck comcheck = new Comcheck();
      comcheck.setId(UUID.randomUUID().toString());
      comcheck.setExercise(simulationProxy);
      ComcheckStatus status = new ComcheckStatus();
      status.setId(UUID.randomUUID().toString());
      status.setComcheck(comcheck);
      Communication communication = new Communication();
      communication.setId(UUID.randomUUID().toString());
      communication.setInject(simulationInject(simulationProxy));
      List<Base> children = List.of(question, answer, evaluation, status, communication);

      // Act
      for (Base child : children) {
        listener.onDatabaseUpdate(event(DATA_UPDATE, child));
        buffer.drain();
        clock.advance(Duration.ofSeconds(2));
      }

      // Assert
      verify(detailWatcherA.session(), times(children.size())).sendMessage(invalidateDetail);
      assertNotLoaded(simulationProxy);
    }

    @Test
    @DisplayName("grandchildren whose parent is a proxy produce nothing and load nothing")
    void given_grandchildrenWithParentProxies_should_produceNothing() throws IOException {
      // Arrange
      LessonsQuestion questionProxy = proxy(LessonsQuestion.class, UUID.randomUUID().toString());
      LessonsAnswer answer = new LessonsAnswer();
      answer.setId(UUID.randomUUID().toString());
      answer.setQuestion(questionProxy);
      Objective objectiveProxy = proxy(Objective.class, UUID.randomUUID().toString());
      Evaluation evaluation = new Evaluation();
      evaluation.setId(UUID.randomUUID().toString());
      evaluation.setObjective(objectiveProxy);
      Comcheck comcheckProxy = proxy(Comcheck.class, UUID.randomUUID().toString());
      ComcheckStatus status = new ComcheckStatus();
      status.setId(UUID.randomUUID().toString());
      status.setComcheck(comcheckProxy);
      Inject injectProxy = proxy(Inject.class, UUID.randomUUID().toString());
      Communication communication = new Communication();
      communication.setId(UUID.randomUUID().toString());
      communication.setInject(injectProxy);

      // Act
      for (Base child : List.<Base>of(answer, evaluation, status, communication)) {
        listener.onDatabaseUpdate(event(DATA_UPDATE, child));
      }

      // Assert
      assertNothingSent();
      verify(questionProxy, never()).getCategory();
      verify(objectiveProxy, never()).getExercise();
      verify(comcheckProxy, never()).getExercise();
      verify(injectProxy, never()).getExercise();
    }

    @Test
    @DisplayName("a team or document reaches the screens of its loaded simulations")
    void given_teamAndDocumentWithLoadedSimulations_should_invalidateDetail() throws IOException {
      // Arrange
      Exercise simulationProxy = simulationProxy();
      Team team = new Team();
      team.setId(UUID.randomUUID().toString());
      team.setExercises(new HashSet<>(Set.of(simulationProxy)));
      Document document = new Document();
      document.setId(UUID.randomUUID().toString());
      document.setExercises(new HashSet<>(Set.of(simulationProxy)));

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, team));
      buffer.drain();
      clock.advance(Duration.ofSeconds(2));
      listener.onDatabaseUpdate(event(DATA_UPDATE, document));
      buffer.drain();

      // Assert
      verify(detailWatcherA.session(), times(2)).sendMessage(invalidateDetail);
      assertNotLoaded(simulationProxy);
    }

    @Test
    @DisplayName("a team whose simulations are not loaded produces nothing and loads nothing")
    @SuppressWarnings("unchecked")
    void given_teamWithLazySimulations_should_produceNothing() throws IOException {
      // Arrange
      Set<Exercise> lazySimulations =
          mock(Set.class, withSettings().extraInterfaces(PersistentCollection.class));
      when(((PersistentCollection<?>) lazySimulations).wasInitialized()).thenReturn(false);
      Team team = new Team();
      team.setId(UUID.randomUUID().toString());
      team.setExercises(lazySimulations);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, team));

      // Assert
      assertNothingSent();
      verify(lazySimulations, never()).iterator();
    }

    @Test
    @DisplayName("a native simulation delete announced by an index event reaches its screen")
    void given_indexDelete_should_invalidateWatchedSimulation() throws IOException {
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, simulationId));

      assertDetailOnly();
    }

    @Test
    @DisplayName("a native delete on a request thread also invalidates that tenant's lists")
    void given_indexDeleteWithThreadTenant_should_invalidateListsOfThatTenant() throws IOException {
      // Arrange
      TenantContext.setCurrentTenant(TENANT_A);

      // Act
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, simulationId));
      buffer.drain();

      // Assert
      verify(listWatcherA.session()).sendMessage(invalidateList);
      verify(detailWatcherA.session()).sendMessage(invalidateDetail);
      verify(socketA.session())
          .sendMessage(new TextMessage(StreamMessages.invalidate(StreamTopic.LIST_SCENARIOS)));
      verify(listWatcherB.session(), never()).sendMessage(any());
      verify(socketB.session(), never()).sendMessage(any());
    }
  }

  @Nested
  @DisplayName("assets, asset groups and findings: their lists and screens")
  class AssetsAndFindings {

    private String assetId;
    private String assetGroupId;
    private String findingId;
    private StreamConnection assetsWatcherA;
    private StreamConnection assetGroupsWatcherA;
    private StreamConnection findingsWatcherA;
    private StreamConnection assetsWatcherB;
    private StreamConnection assetWatcherA;
    private StreamConnection assetGroupWatcherA;
    private StreamConnection findingWatcherA;

    @BeforeEach
    void setUp() {
      assetId = UUID.randomUUID().toString();
      assetGroupId = UUID.randomUUID().toString();
      findingId = UUID.randomUUID().toString();
      assetsWatcherA = watching("assets-a", TENANT_A, StreamTopic.LIST_ASSETS);
      assetGroupsWatcherA = watching("asset-groups-a", TENANT_A, StreamTopic.LIST_ASSET_GROUPS);
      findingsWatcherA = watching("findings-a", TENANT_A, StreamTopic.LIST_FINDINGS);
      assetsWatcherB = watching("assets-b", TENANT_B, StreamTopic.LIST_ASSETS);
      assetWatcherA = watching("asset-a", TENANT_A, StreamTopic.asset(assetId));
      assetGroupWatcherA =
          watching("asset-group-a", TENANT_A, StreamTopic.assetGroup(assetGroupId));
      findingWatcherA = watching("finding-a", TENANT_A, StreamTopic.finding(findingId));
    }

    @AfterEach
    void tearDown() {
      TenantContext.clearCurrentTenant();
    }

    private StreamConnection watching(String id, String tenantId, StreamTopic topic) {
      StreamConnection socket = connection(id, tenantId);
      registry.register(socket);
      registry.replaceTopics(socket, Set.of(topic));
      return socket;
    }

    private void assertSent(StreamConnection socket, StreamTopic topic) throws IOException {
      verify(socket.session()).sendMessage(new TextMessage(StreamMessages.invalidate(topic)));
    }

    private static void assertSilent(StreamConnection... sockets) throws IOException {
      for (StreamConnection socket : sockets) {
        verify(socket.session(), never()).sendMessage(any());
      }
    }

    @Test
    @DisplayName("a finding written natively reaches the findings list, its screen and its asset")
    void given_findingWritten_should_invalidateListScreenAndAsset() throws IOException {
      // Act
      listener.onFindingWritten(
          new FindingWrittenEvent(TENANT_A, findingId, UUID.randomUUID().toString(), assetId));
      buffer.drain();

      // Assert
      assertSent(findingsWatcherA, StreamTopic.LIST_FINDINGS);
      assertSent(findingWatcherA, StreamTopic.finding(findingId));
      assertSent(assetWatcherA, StreamTopic.asset(assetId));
      assertSilent(assetsWatcherA, assetsWatcherB, assetGroupsWatcherA, assetGroupWatcherA);
    }

    private <T extends Asset> T asset(T asset) {
      asset.setId(assetId);
      asset.setName("asset");
      asset.setTenant(new Tenant(TENANT_A));
      return asset;
    }

    private Asset assetProxy() {
      return proxy(Asset.class, assetId);
    }

    private AssetGroup assetGroupProxy() {
      return proxy(AssetGroup.class, assetGroupId);
    }

    private static void assertNotLoaded(Asset assetProxy) {
      verify(assetProxy, never()).getId();
      verify(assetProxy, never()).getTenant();
      verify(assetProxy, never()).getAssetGroups();
    }

    @SuppressWarnings("unchecked")
    private static <T> List<T> lazyList() {
      List<T> lazy = mock(List.class, withSettings().extraInterfaces(PersistentCollection.class));
      when(((PersistentCollection<?>) lazy).wasInitialized()).thenReturn(false);
      return lazy;
    }

    @ParameterizedTest
    @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
    @DisplayName("an asset change reaches the asset and asset-group lists and its screen")
    void given_assetChange_should_invalidateListsAndDetail(String type) throws IOException {
      // Act
      listener.onDatabaseUpdate(event(type, asset(new Asset())));
      buffer.drain();

      // Assert
      assertSent(assetsWatcherA, StreamTopic.LIST_ASSETS);
      assertSent(assetGroupsWatcherA, StreamTopic.LIST_ASSET_GROUPS);
      assertSent(assetWatcherA, StreamTopic.asset(assetId));
      assertSilent(assetsWatcherB, findingsWatcherA, socketA, socketB);
    }

    @Test
    @DisplayName("an endpoint is an asset; a security platform is not one of the inventory's")
    void given_endpointAndSecurityPlatform_should_invalidateEndpointOnly() throws IOException {
      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, asset(new SecurityPlatform())));
      buffer.drain();

      // Assert
      assertSilent(assetsWatcherA, assetGroupsWatcherA, assetWatcherA);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, asset(new Endpoint())));
      buffer.drain();

      // Assert
      assertSent(assetsWatcherA, StreamTopic.LIST_ASSETS);
      assertSent(assetWatcherA, StreamTopic.asset(assetId));
    }

    @Test
    @DisplayName("an asset reaches the screens of its loaded groups, read from their proxies")
    void given_assetWithLoadedGroups_should_invalidateGroupDetail() throws IOException {
      // Arrange
      AssetGroup groupProxy = assetGroupProxy();
      Endpoint endpoint = asset(new Endpoint());
      endpoint.setAssetGroups(new HashSet<>(Set.of(groupProxy)));

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, endpoint));
      buffer.drain();

      // Assert
      assertSent(assetGroupWatcherA, StreamTopic.assetGroup(assetGroupId));
      verify(groupProxy, never()).getId();
      verify(groupProxy, never()).getAssets();
    }

    @Test
    @DisplayName("an asset whose groups are not loaded reaches no group screen, loading nothing")
    @SuppressWarnings("unchecked")
    void given_assetWithLazyGroups_should_notIterateThem() throws IOException {
      // Arrange
      Set<AssetGroup> lazyGroups =
          mock(Set.class, withSettings().extraInterfaces(PersistentCollection.class));
      when(((PersistentCollection<?>) lazyGroups).wasInitialized()).thenReturn(false);
      Asset asset = asset(new Asset());
      asset.setAssetGroups(lazyGroups);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, asset));
      buffer.drain();

      // Assert
      assertSent(assetWatcherA, StreamTopic.asset(assetId));
      assertSilent(assetGroupWatcherA);
      verify(lazyGroups, never()).iterator();
    }

    @Test
    @DisplayName(
        "an agent (heartbeat, inactivity) reaches the asset list and its endpoint's screen")
    void given_agentChange_should_invalidateAssetListAndEndpointDetail() throws IOException {
      // Arrange
      Asset endpointProxy = assetProxy();
      Agent agent = new Agent();
      agent.setAsset(endpointProxy);
      agent.setTenant(new Tenant(TENANT_A));

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, agent));
      buffer.drain();

      // Assert
      assertSent(assetsWatcherA, StreamTopic.LIST_ASSETS);
      assertSent(assetWatcherA, StreamTopic.asset(assetId));
      assertSilent(assetsWatcherB, assetGroupsWatcherA);
      assertNotLoaded(endpointProxy);
    }

    @ParameterizedTest
    @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
    @DisplayName("an asset group reaches its list, its screen and its loaded members' screens")
    void given_assetGroupChange_should_invalidateListDetailAndMembers(String type)
        throws IOException {
      // Arrange
      Asset memberProxy = assetProxy();
      AssetGroup group = new AssetGroup();
      group.setId(assetGroupId);
      group.setTenant(new Tenant(TENANT_A));
      group.setAssets(new ArrayList<>(List.of(memberProxy)));

      // Act
      listener.onDatabaseUpdate(event(type, group));
      buffer.drain();

      // Assert
      assertSent(assetGroupsWatcherA, StreamTopic.LIST_ASSET_GROUPS);
      assertSent(assetGroupWatcherA, StreamTopic.assetGroup(assetGroupId));
      assertSent(assetWatcherA, StreamTopic.asset(assetId));
      assertSilent(assetsWatcherA, assetsWatcherB);
      assertNotLoaded(memberProxy);
    }

    @Test
    @DisplayName("an asset group whose members are not loaded reaches no asset screen")
    void given_assetGroupWithLazyMembers_should_notIterateThem() throws IOException {
      // Arrange
      List<Asset> lazyMembers = lazyList();
      AssetGroup group = new AssetGroup();
      group.setId(assetGroupId);
      group.setTenant(new Tenant(TENANT_A));
      group.setAssets(lazyMembers);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, group));
      buffer.drain();

      // Assert
      assertSent(assetGroupWatcherA, StreamTopic.assetGroup(assetGroupId));
      assertSilent(assetWatcherA);
      verify(lazyMembers, never()).iterator();
    }

    @Test
    @DisplayName("a finding reaches the findings list, its screen and its loaded assets' screens")
    void given_finding_should_invalidateListDetailAndAssets() throws IOException {
      // Arrange
      Asset assetProxy = assetProxy();
      String injectId = UUID.randomUUID().toString();
      Inject injectProxy = proxy(Inject.class, injectId);
      StreamConnection atomicTestingWatcherA =
          watching("atomic-testing-a", TENANT_A, StreamTopic.atomicTesting(injectId));
      Finding finding = new Finding();
      finding.setId(findingId);
      finding.setTenant(new Tenant(TENANT_A));
      finding.setInject(injectProxy);
      finding.setAssets(new ArrayList<>(List.of(assetProxy)));

      // Act
      listener.onDatabaseUpdate(event(DATA_PERSIST, finding));
      buffer.drain();

      // Assert: the atomic-testing mapping is kept
      assertSent(findingsWatcherA, StreamTopic.LIST_FINDINGS);
      assertSent(findingWatcherA, StreamTopic.finding(findingId));
      assertSent(assetWatcherA, StreamTopic.asset(assetId));
      assertSent(atomicTestingWatcherA, StreamTopic.atomicTesting(injectId));
      assertSilent(assetsWatcherA, assetsWatcherB);
      assertNotLoaded(assetProxy);
      verify(injectProxy, never()).getExercise();
    }

    @Test
    @DisplayName("a finding without an inject still reaches its list and screen")
    void given_findingWithoutInject_should_invalidateListAndDetail() throws IOException {
      // Arrange
      List<Asset> lazyAssets = lazyList();
      Finding finding = new Finding();
      finding.setId(findingId);
      finding.setTenant(new Tenant(TENANT_A));
      finding.setAssets(lazyAssets);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, finding));
      buffer.drain();

      // Assert
      assertSent(findingsWatcherA, StreamTopic.LIST_FINDINGS);
      assertSent(findingWatcherA, StreamTopic.finding(findingId));
      assertSilent(assetWatcherA);
      verify(lazyAssets, never()).iterator();
    }

    @Test
    @DisplayName("a technical expectation reaches its asset's and group's screens via the proxies")
    void given_technicalExpectation_should_invalidateTargetScreens() throws IOException {
      // Arrange
      Asset assetProxy = assetProxy();
      AssetGroup groupProxy = assetGroupProxy();
      DetectionInjectExpectation expectation = new DetectionInjectExpectation();
      expectation.setId(UUID.randomUUID().toString());
      expectation.setInject(proxy(Inject.class, UUID.randomUUID().toString()));
      expectation.setAsset(assetProxy);
      expectation.setAssetGroup(groupProxy);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, expectation));
      buffer.drain();

      // Assert
      assertSent(assetWatcherA, StreamTopic.asset(assetId));
      assertSent(assetGroupWatcherA, StreamTopic.assetGroup(assetGroupId));
      assertSilent(assetsWatcherA, assetGroupsWatcherA);
      assertNotLoaded(assetProxy);
      verify(groupProxy, never()).getId();
    }

    @Test
    @DisplayName("an inject reaches the screens of its loaded target assets and groups")
    void given_injectWithLoadedTargets_should_invalidateTargetScreens() throws IOException {
      // Arrange
      Asset assetProxy = assetProxy();
      Inject inject = atomicTesting(TENANT_A);
      inject.setAssets(new ArrayList<>(List.of(assetProxy)));
      inject.setAssetGroups(new ArrayList<>(List.of(assetGroupProxy())));

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, inject));
      buffer.drain();

      // Assert
      assertSent(assetWatcherA, StreamTopic.asset(assetId));
      assertSent(assetGroupWatcherA, StreamTopic.assetGroup(assetGroupId));
      assertNotLoaded(assetProxy);
    }

    @Test
    @DisplayName("an inject whose targets are not loaded reaches no asset screen")
    void given_injectWithLazyTargets_should_notIterateThem() throws IOException {
      // Arrange
      List<Asset> lazyAssets = lazyList();
      Inject inject = atomicTesting(TENANT_A);
      inject.setAssets(lazyAssets);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, inject));
      buffer.drain();

      // Assert
      assertSilent(assetWatcherA);
      verify(lazyAssets, never()).iterator();
    }

    @Test
    @DisplayName("a native delete reaches the watched screens, and the thread tenant's lists")
    void given_indexDelete_should_invalidateWatchedScreensAndThreadTenantLists()
        throws IOException {
      // Arrange
      TenantContext.setCurrentTenant(TENANT_A);

      // Act
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, assetId));
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, findingId));
      buffer.drain();

      // Assert
      assertSent(assetWatcherA, StreamTopic.asset(assetId));
      assertSent(findingWatcherA, StreamTopic.finding(findingId));
      assertSent(assetsWatcherA, StreamTopic.LIST_ASSETS);
      assertSent(assetGroupsWatcherA, StreamTopic.LIST_ASSET_GROUPS);
      assertSent(findingsWatcherA, StreamTopic.LIST_FINDINGS);
      assertSilent(assetGroupWatcherA, assetsWatcherB, socketB);
    }

    @Test
    @DisplayName("without a thread tenant, a native delete reaches the watched screen only")
    void given_indexDeleteWithoutTenant_should_invalidateWatchedScreenOnly() throws IOException {
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, assetGroupId));
      buffer.drain();

      assertSent(assetGroupWatcherA, StreamTopic.assetGroup(assetGroupId));
      assertSilent(assetsWatcherA, assetGroupsWatcherA, findingsWatcherA, assetWatcherA);
    }
  }

  @Nested
  @DisplayName("teams, persons and organizations: their lists and screens")
  class TeamsPersonsAndOrganizations {

    private String teamId;
    private String userId;
    private String organizationId;
    private StreamConnection teamsWatcherA;
    private StreamConnection personsWatcherA;
    private StreamConnection organizationsWatcherA;
    private StreamConnection teamsWatcherB;
    private StreamConnection personsWatcherB;
    private StreamConnection teamWatcherA;
    private StreamConnection personWatcherA;
    private StreamConnection organizationWatcherA;

    @BeforeEach
    void setUp() {
      teamId = UUID.randomUUID().toString();
      userId = UUID.randomUUID().toString();
      organizationId = UUID.randomUUID().toString();
      teamsWatcherA = watching("teams-a", TENANT_A, StreamTopic.LIST_TEAMS);
      personsWatcherA = watching("persons-a", TENANT_A, StreamTopic.LIST_PERSONS);
      organizationsWatcherA = watching("organizations-a", TENANT_A, StreamTopic.LIST_ORGANIZATIONS);
      teamsWatcherB = watching("teams-b", TENANT_B, StreamTopic.LIST_TEAMS);
      personsWatcherB = watching("persons-b", TENANT_B, StreamTopic.LIST_PERSONS);
      teamWatcherA = watching("team-a", TENANT_A, StreamTopic.team(teamId));
      personWatcherA = watching("person-a", TENANT_A, StreamTopic.person(userId));
      organizationWatcherA =
          watching("organization-a", TENANT_A, StreamTopic.organization(organizationId));
    }

    @AfterEach
    void tearDown() {
      TenantContext.clearCurrentTenant();
    }

    private StreamConnection watching(String id, String tenantId, StreamTopic topic) {
      StreamConnection socket = connection(id, tenantId);
      registry.register(socket);
      registry.replaceTopics(socket, Set.of(topic));
      return socket;
    }

    private void assertSent(StreamConnection socket, StreamTopic topic) throws IOException {
      verify(socket.session()).sendMessage(new TextMessage(StreamMessages.invalidate(topic)));
    }

    private static void assertSilent(StreamConnection... sockets) throws IOException {
      for (StreamConnection socket : sockets) {
        verify(socket.session(), never()).sendMessage(any());
      }
    }

    @SuppressWarnings("unchecked")
    private static <T> List<T> lazyList() {
      List<T> lazy = mock(List.class, withSettings().extraInterfaces(PersistentCollection.class));
      when(((PersistentCollection<?>) lazy).wasInitialized()).thenReturn(false);
      return lazy;
    }

    private Team team() {
      Team team = new Team();
      team.setId(teamId);
      team.setName("team");
      team.setTenant(new Tenant(TENANT_A));
      return team;
    }

    private User user() {
      User user = new User();
      user.setId(userId);
      user.setEmail("person@unittests.invalid");
      return user;
    }

    @ParameterizedTest
    @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
    @DisplayName("a team reaches its list, its screen, its loaded members and its organization")
    void given_teamChange_should_invalidateListDetailMembersAndOrganization(String type)
        throws IOException {
      // Arrange
      User memberProxy = proxy(User.class, userId);
      Organization organizationProxy = proxy(Organization.class, organizationId);
      Team team = team();
      team.setUsers(new ArrayList<>(List.of(memberProxy)));
      team.setOrganization(organizationProxy);

      // Act
      listener.onDatabaseUpdate(event(type, team));
      buffer.drain();

      // Assert
      assertSent(teamsWatcherA, StreamTopic.LIST_TEAMS);
      assertSent(teamWatcherA, StreamTopic.team(teamId));
      assertSent(personWatcherA, StreamTopic.person(userId));
      assertSent(organizationWatcherA, StreamTopic.organization(organizationId));
      assertSilent(teamsWatcherB, personsWatcherA, organizationsWatcherA, socketA, socketB);
      verify(memberProxy, never()).getId();
      verify(memberProxy, never()).getTeams();
      verify(organizationProxy, never()).getId();
    }

    @Test
    @DisplayName("a team whose members are not loaded reaches no person screen, loading nothing")
    void given_teamWithLazyMembers_should_notIterateThem() throws IOException {
      // Arrange
      List<User> lazyMembers = lazyList();
      Team team = team();
      team.setUsers(lazyMembers);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, team));
      buffer.drain();

      // Assert
      assertSent(teamWatcherA, StreamTopic.team(teamId));
      assertSilent(personWatcherA);
      verify(lazyMembers, never()).iterator();
    }

    @ParameterizedTest
    @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
    @DisplayName("a user reaches the persons list of its loaded tenants, its screen and its teams")
    void given_userWithLoadedTenants_should_invalidateTheirListsDetailAndTeams(String type)
        throws IOException {
      // Arrange
      Team teamProxy = proxy(Team.class, teamId);
      Organization organizationProxy = proxy(Organization.class, organizationId);
      User user = user();
      user.setTenants(new ArrayList<>(List.of(new Tenant(TENANT_A), new Tenant(TENANT_B))));
      user.setTeams(new ArrayList<>(List.of(teamProxy)));
      user.setOrganization(organizationProxy);

      // Act
      listener.onDatabaseUpdate(event(type, user));
      buffer.drain();

      // Assert
      assertSent(personsWatcherA, StreamTopic.LIST_PERSONS);
      assertSent(personsWatcherB, StreamTopic.LIST_PERSONS);
      assertSent(personWatcherA, StreamTopic.person(userId));
      assertSent(teamWatcherA, StreamTopic.team(teamId));
      assertSent(organizationWatcherA, StreamTopic.organization(organizationId));
      assertSilent(teamsWatcherA, teamsWatcherB, organizationsWatcherA);
      verify(teamProxy, never()).getId();
      verify(organizationProxy, never()).getId();
    }

    @Test
    @DisplayName("a user whose tenants are not loaded reaches the thread tenant's list only")
    void given_userWithLazyTenants_should_invalidateThreadTenantListOnly() throws IOException {
      // Arrange
      TenantContext.setCurrentTenant(TENANT_A);
      List<Tenant> lazyTenants = lazyList();
      List<Team> lazyTeams = lazyList();
      User user = user();
      user.setTenants(lazyTenants);
      user.setTeams(lazyTeams);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, user));
      buffer.drain();

      // Assert
      assertSent(personsWatcherA, StreamTopic.LIST_PERSONS);
      assertSent(personWatcherA, StreamTopic.person(userId));
      assertSilent(personsWatcherB, teamWatcherA);
      verify(lazyTenants, never()).iterator();
      verify(lazyTeams, never()).iterator();
    }

    @Test
    @DisplayName("without loaded tenants nor thread tenant, a user reaches its screen only")
    void given_userWithoutKnownTenant_should_invalidateDetailOnly() throws IOException {
      // Arrange
      User user = user();
      user.setTenants(lazyList());

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, user));
      buffer.drain();

      // Assert
      assertSent(personWatcherA, StreamTopic.person(userId));
      assertSilent(personsWatcherA, personsWatcherB);
    }

    @ParameterizedTest
    @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
    @DisplayName("an organization reaches its own tenant's list and its screen")
    void given_organizationChange_should_invalidateListAndDetail(String type) throws IOException {
      // Arrange
      Organization organization = new Organization();
      organization.setId(organizationId);
      organization.setName("organization");
      organization.setTenant(new Tenant(TENANT_A));

      // Act
      listener.onDatabaseUpdate(event(type, organization));
      buffer.drain();

      // Assert: the persons list resolves organization names elsewhere, it is not invalidated
      assertSent(organizationsWatcherA, StreamTopic.LIST_ORGANIZATIONS);
      assertSent(organizationWatcherA, StreamTopic.organization(organizationId));
      assertSilent(personsWatcherA, teamsWatcherA, teamsWatcherB, personWatcherA);
    }

    @Test
    @DisplayName("a native delete reaches the watched screens, and the thread tenant's lists")
    void given_indexDelete_should_invalidateWatchedScreensAndThreadTenantLists()
        throws IOException {
      // Arrange
      TenantContext.setCurrentTenant(TENANT_A);

      // Act
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, teamId));
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, userId));
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, organizationId));
      buffer.drain();

      // Assert
      assertSent(teamWatcherA, StreamTopic.team(teamId));
      assertSent(personWatcherA, StreamTopic.person(userId));
      assertSent(organizationWatcherA, StreamTopic.organization(organizationId));
      assertSent(teamsWatcherA, StreamTopic.LIST_TEAMS);
      assertSent(personsWatcherA, StreamTopic.LIST_PERSONS);
      assertSent(organizationsWatcherA, StreamTopic.LIST_ORGANIZATIONS);
      assertSilent(teamsWatcherB, personsWatcherB);
    }
  }

  @Nested
  @DisplayName("integrations: one list for every integration screen")
  class Integrations {

    private StreamConnection integrationsWatcherA;
    private StreamConnection integrationsWatcherB;

    @BeforeEach
    void setUp() {
      integrationsWatcherA = watching("integrations-a", TENANT_A);
      integrationsWatcherB = watching("integrations-b", TENANT_B);
    }

    @AfterEach
    void tearDown() {
      TenantContext.clearCurrentTenant();
    }

    private StreamConnection watching(String id, String tenantId) {
      StreamConnection socket = connection(id, tenantId);
      registry.register(socket);
      registry.replaceTopics(socket, Set.of(StreamTopic.LIST_INTEGRATIONS));
      return socket;
    }

    private void assertSent(StreamConnection socket) throws IOException {
      verify(socket.session())
          .sendMessage(new TextMessage(StreamMessages.invalidate(StreamTopic.LIST_INTEGRATIONS)));
    }

    private static void assertSilent(StreamConnection... sockets) throws IOException {
      for (StreamConnection socket : sockets) {
        verify(socket.session(), never()).sendMessage(any());
      }
    }

    private ConnectorInstancePersisted connectorInstance() {
      ConnectorInstancePersisted instance = new ConnectorInstancePersisted();
      instance.setId(UUID.randomUUID().toString());
      instance.setTenant(new Tenant(TENANT_A));
      return instance;
    }

    @ParameterizedTest
    @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
    @DisplayName("an injector, contract, collector, executor or instance reaches its tenant only")
    void given_tenantConnector_should_invalidateOwnTenantOnly(String type) throws IOException {
      // Arrange
      Injector injector = new Injector();
      injector.setId(UUID.randomUUID().toString());
      injector.setTenantId(TENANT_A);
      InjectorContract contract = new InjectorContract();
      contract.setId(UUID.randomUUID().toString());
      contract.setTenant(new Tenant(TENANT_A));
      Collector collector = new Collector();
      collector.setId(UUID.randomUUID().toString());
      collector.setTenantId(TENANT_A);
      Executor executor = new Executor();
      executor.setId(UUID.randomUUID().toString());
      executor.setTenantId(TENANT_A);

      for (Base connector : List.of(injector, contract, collector, executor, connectorInstance())) {
        // Act
        listener.onDatabaseUpdate(event(type, connector));
        buffer.drain();
        clock.advance(Duration.ofSeconds(2));
      }

      // Assert
      verify(integrationsWatcherA.session(), times(5))
          .sendMessage(new TextMessage(StreamMessages.invalidate(StreamTopic.LIST_INTEGRATIONS)));
      assertSilent(integrationsWatcherB, socketA, socketB);
    }

    @Test
    @DisplayName("a configuration or log reaches the tenant of its loaded instance")
    void given_configurationAndLogOfLoadedInstance_should_invalidateInstanceTenant()
        throws IOException {
      // Arrange
      ConnectorInstancePersisted instance = connectorInstance();
      ConnectorInstanceConfiguration configuration = new ConnectorInstanceConfiguration();
      configuration.setConnectorInstance(instance);
      ConnectorInstanceLog entry = new ConnectorInstanceLog();
      entry.setConnectorInstance(instance);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, configuration));
      listener.onDatabaseUpdate(event(DATA_PERSIST, entry));
      buffer.drain();

      // Assert: a burst of logs is one invalidation per interval
      assertSent(integrationsWatcherA);
      assertSilent(integrationsWatcherB);
    }

    @Test
    @DisplayName("a log of an instance proxy reaches the thread tenant, loading nothing")
    void given_logOfInstanceProxy_should_invalidateThreadTenant() throws IOException {
      // Arrange
      TenantContext.setCurrentTenant(TENANT_B);
      ConnectorInstancePersisted instanceProxy =
          proxy(ConnectorInstancePersisted.class, UUID.randomUUID().toString());
      ConnectorInstanceLog entry = new ConnectorInstanceLog();
      entry.setConnectorInstance(instanceProxy);

      // Act
      listener.onDatabaseUpdate(event(DATA_PERSIST, entry));
      buffer.drain();

      // Assert
      assertSent(integrationsWatcherB);
      assertSilent(integrationsWatcherA);
      verify(instanceProxy, never()).getTenant();
    }

    @Test
    @DisplayName("a catalog connector, platform-level, reaches every tenant watching the list")
    void given_catalogConnector_should_invalidateEveryWatchingTenant() throws IOException {
      // Arrange
      CatalogConnector catalogConnector = new CatalogConnector();
      catalogConnector.setId(UUID.randomUUID().toString());

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, catalogConnector));
      buffer.drain();

      // Assert
      assertSent(integrationsWatcherA);
      assertSent(integrationsWatcherB);
      assertSilent(socketA, socketB);
    }

    @Test
    @DisplayName("a native delete reaches the thread tenant's integrations list")
    void given_indexDelete_should_invalidateThreadTenantList() throws IOException {
      // Arrange
      TenantContext.setCurrentTenant(TENANT_A);

      // Act
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, UUID.randomUUID().toString()));
      buffer.drain();

      // Assert
      assertSent(integrationsWatcherA);
      assertSilent(integrationsWatcherB);
    }
  }

  @Nested
  @DisplayName("threat arsenal, credentials and components: their lists and screens")
  class ThreatArsenalCredentialsAndComponents {

    private String contractId;
    private String credentialId;
    private StreamConnection payloadsWatcherA;
    private StreamConnection payloadsWatcherB;
    private StreamConnection contractWatcherA;
    private StreamConnection contractWatcherB;
    private StreamConnection credentialsWatcherA;
    private StreamConnection credentialsWatcherB;
    private StreamConnection credentialWatcherA;
    private StreamConnection componentsWatcherA;
    private StreamConnection componentsWatcherB;

    @BeforeEach
    void setUp() {
      contractId = UUID.randomUUID().toString();
      credentialId = UUID.randomUUID().toString();
      payloadsWatcherA = watching("payloads-a", TENANT_A, StreamTopic.LIST_PAYLOADS);
      payloadsWatcherB = watching("payloads-b", TENANT_B, StreamTopic.LIST_PAYLOADS);
      contractWatcherA = watching("contract-a", TENANT_A, StreamTopic.payload(contractId));
      // A built-in contract has the same id in every tenant.
      contractWatcherB = watching("contract-b", TENANT_B, StreamTopic.payload(contractId));
      credentialsWatcherA = watching("credentials-a", TENANT_A, StreamTopic.LIST_CREDENTIALS);
      credentialsWatcherB = watching("credentials-b", TENANT_B, StreamTopic.LIST_CREDENTIALS);
      credentialWatcherA = watching("credential-a", TENANT_A, StreamTopic.credential(credentialId));
      componentsWatcherA = watching("components-a", TENANT_A, StreamTopic.LIST_COMPONENTS);
      componentsWatcherB = watching("components-b", TENANT_B, StreamTopic.LIST_COMPONENTS);
    }

    @AfterEach
    void tearDown() {
      TenantContext.clearCurrentTenant();
    }

    private StreamConnection watching(String id, String tenantId, StreamTopic topic) {
      StreamConnection socket = connection(id, tenantId);
      registry.register(socket);
      registry.replaceTopics(socket, Set.of(topic));
      return socket;
    }

    private void assertSent(StreamConnection socket, StreamTopic topic) throws IOException {
      verify(socket.session()).sendMessage(new TextMessage(StreamMessages.invalidate(topic)));
    }

    private static void assertSilent(StreamConnection... sockets) throws IOException {
      for (StreamConnection socket : sockets) {
        verify(socket.session(), never()).sendMessage(any());
      }
    }

    private Command payload() {
      Command payload = new Command();
      payload.setId(UUID.randomUUID().toString());
      payload.setTenant(new Tenant(TENANT_A));
      return payload;
    }

    @ParameterizedTest
    @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
    @DisplayName("a payload reaches its own tenant's threat arsenal only (its contract is unknown)")
    void given_payloadChange_should_invalidateOwnTenantList(String type) throws IOException {
      // Act
      listener.onDatabaseUpdate(event(type, payload()));
      buffer.drain();

      // Assert
      assertSent(payloadsWatcherA, StreamTopic.LIST_PAYLOADS);
      assertSilent(payloadsWatcherB, contractWatcherA, contractWatcherB, socketA, socketB);
    }

    @Test
    @DisplayName("a detection remediation of a payload proxy reaches the thread tenant's list")
    void given_remediationOfPayloadProxy_should_invalidateThreadTenantList() throws IOException {
      // Arrange
      TenantContext.setCurrentTenant(TENANT_B);
      Payload payloadProxy = proxy(Payload.class, UUID.randomUUID().toString());
      DetectionRemediation remediation = new DetectionRemediation();
      remediation.setId(UUID.randomUUID().toString());
      remediation.setPayload(payloadProxy);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, remediation));
      buffer.drain();

      // Assert
      assertSent(payloadsWatcherB, StreamTopic.LIST_PAYLOADS);
      assertSilent(payloadsWatcherA, contractWatcherA);
      verify(payloadProxy, never()).getTenant();
    }

    @Test
    @DisplayName("a detection remediation of a loaded payload reaches the payload's tenant")
    void given_remediationOfLoadedPayload_should_invalidatePayloadTenantList() throws IOException {
      // Arrange
      TenantContext.setCurrentTenant(TENANT_B);
      DetectionRemediation remediation = new DetectionRemediation();
      remediation.setId(UUID.randomUUID().toString());
      remediation.setPayload(payload());

      // Act
      listener.onDatabaseUpdate(event(DATA_PERSIST, remediation));
      buffer.drain();

      // Assert
      assertSent(payloadsWatcherA, StreamTopic.LIST_PAYLOADS);
      assertSilent(payloadsWatcherB);
    }

    @ParameterizedTest
    @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
    @DisplayName("an injector contract reaches its tenant's threat arsenal and its screen there")
    void given_injectorContract_should_invalidateOwnTenantListAndScreen(String type)
        throws IOException {
      // Arrange
      InjectorContract contract = new InjectorContract();
      contract.setId(contractId);
      contract.setTenant(new Tenant(TENANT_A));
      contract.setPayload(proxy(Payload.class, UUID.randomUUID().toString()));

      // Act
      listener.onDatabaseUpdate(event(type, contract));
      buffer.drain();

      // Assert
      assertSent(payloadsWatcherA, StreamTopic.LIST_PAYLOADS);
      assertSent(contractWatcherA, StreamTopic.payload(contractId));
      assertSilent(payloadsWatcherB, contractWatcherB);
    }

    @ParameterizedTest
    @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
    @DisplayName(
        "a credential, though unlistened (kept off SSE), reaches its tenant's list and screen")
    void given_credential_should_invalidateOwnTenantListAndScreen(String type) throws IOException {
      // Arrange
      CredentialSecretReference credential = new CredentialSecretReference();
      credential.setId(credentialId);
      credential.setTenant(new Tenant(TENANT_A));
      assertThat(credential.isListened()).isFalse();

      // Act
      listener.onDatabaseUpdate(event(type, credential));
      buffer.drain();

      // Assert
      assertSent(credentialsWatcherA, StreamTopic.LIST_CREDENTIALS);
      assertSent(credentialWatcherA, StreamTopic.credential(credentialId));
      assertSilent(credentialsWatcherB, payloadsWatcherA, componentsWatcherA);
    }

    @ParameterizedTest
    @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
    @DisplayName("every component type reaches its own tenant's components list only")
    void given_component_should_invalidateOwnTenantComponentsList(String type) throws IOException {
      // Arrange
      Tenant tenantA = new Tenant(TENANT_A);
      Document document = new Document();
      document.setId(UUID.randomUUID().toString());
      document.setTenant(tenantA);
      Channel channel = new Channel();
      channel.setId(UUID.randomUUID().toString());
      channel.setTenant(tenantA);
      Challenge challenge = new Challenge();
      challenge.setId(UUID.randomUUID().toString());
      challenge.setTenant(tenantA);
      PhishingLandingPage landingPage = new PhishingLandingPage();
      landingPage.setId(UUID.randomUUID().toString());
      landingPage.setTenant(tenantA);
      PhishingEmailTemplate emailTemplate = new PhishingEmailTemplate();
      emailTemplate.setId(UUID.randomUUID().toString());
      emailTemplate.setTenant(tenantA);
      LessonsTemplate lessonsTemplate = new LessonsTemplate();
      lessonsTemplate.setId(UUID.randomUUID().toString());
      lessonsTemplate.setTenant(tenantA);

      for (Base component :
          List.of(document, channel, challenge, landingPage, emailTemplate, lessonsTemplate)) {
        // Act
        listener.onDatabaseUpdate(event(type, component));
        buffer.drain();
        clock.advance(Duration.ofSeconds(2));
      }

      // Assert
      verify(componentsWatcherA.session(), times(6))
          .sendMessage(new TextMessage(StreamMessages.invalidate(StreamTopic.LIST_COMPONENTS)));
      assertSilent(componentsWatcherB, payloadsWatcherA, socketA, socketB);
    }

    @Test
    @DisplayName("a challenge flag or lessons template category reaches its loaded parent's tenant")
    void given_childOfLoadedComponent_should_invalidateParentTenant() throws IOException {
      // Arrange
      TenantContext.setCurrentTenant(TENANT_B);
      Challenge challenge = new Challenge();
      challenge.setId(UUID.randomUUID().toString());
      challenge.setTenant(new Tenant(TENANT_A));
      ChallengeFlag flag = new ChallengeFlag();
      flag.setChallenge(challenge);
      LessonsTemplate template = new LessonsTemplate();
      template.setId(UUID.randomUUID().toString());
      template.setTenant(new Tenant(TENANT_A));
      LessonsTemplateCategory category = new LessonsTemplateCategory();
      category.setTemplate(template);
      LessonsTemplateQuestion question = new LessonsTemplateQuestion();
      question.setCategory(category);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, flag));
      listener.onDatabaseUpdate(event(DATA_UPDATE, category));
      listener.onDatabaseUpdate(event(DATA_UPDATE, question));
      buffer.drain();

      // Assert: one invalidation per interval
      assertSent(componentsWatcherA, StreamTopic.LIST_COMPONENTS);
      assertSilent(componentsWatcherB);
    }

    @Test
    @DisplayName("a child whose parent is a proxy reaches the thread tenant, loading nothing")
    void given_childOfComponentProxy_should_invalidateThreadTenant() throws IOException {
      // Arrange
      TenantContext.setCurrentTenant(TENANT_B);
      LessonsTemplateCategory categoryProxy =
          proxy(LessonsTemplateCategory.class, UUID.randomUUID().toString());
      LessonsTemplateQuestion question = new LessonsTemplateQuestion();
      question.setCategory(categoryProxy);
      Challenge challengeProxy = proxy(Challenge.class, UUID.randomUUID().toString());
      ChallengeFlag flag = new ChallengeFlag();
      flag.setChallenge(challengeProxy);

      // Act
      listener.onDatabaseUpdate(event(DATA_PERSIST, question));
      listener.onDatabaseUpdate(event(DATA_PERSIST, flag));
      buffer.drain();

      // Assert
      assertSent(componentsWatcherB, StreamTopic.LIST_COMPONENTS);
      assertSilent(componentsWatcherA);
      verify(categoryProxy, never()).getTemplate();
      verify(challengeProxy, never()).getTenant();
    }

    @Test
    @DisplayName("a native delete reaches the watched screens, and the thread tenant's lists")
    void given_indexDelete_should_invalidateWatchedScreensAndThreadTenantLists()
        throws IOException {
      // Arrange
      TenantContext.setCurrentTenant(TENANT_A);

      // Act
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, contractId));
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, credentialId));
      buffer.drain();

      // Assert
      assertSent(contractWatcherA, StreamTopic.payload(contractId));
      assertSent(credentialWatcherA, StreamTopic.credential(credentialId));
      assertSent(payloadsWatcherA, StreamTopic.LIST_PAYLOADS);
      assertSent(credentialsWatcherA, StreamTopic.LIST_CREDENTIALS);
      assertSent(componentsWatcherA, StreamTopic.LIST_COMPONENTS);
      assertSilent(payloadsWatcherB, credentialsWatcherB, componentsWatcherB);
    }
  }

  @Nested
  @DisplayName("dashboards, reports and analytics: their lists and screens")
  class DashboardsReportsAndAnalytics {

    private String dashboardId;
    private String reportingId;
    private StreamConnection dashboardsWatcherA;
    private StreamConnection dashboardsWatcherB;
    private StreamConnection dashboardWatcherA;
    private StreamConnection reportsWatcherA;
    private StreamConnection reportsWatcherB;
    private StreamConnection reportWatcherA;
    private StreamConnection analyticsWatcherA;
    private StreamConnection analyticsWatcherB;

    @BeforeEach
    void setUp() {
      dashboardId = UUID.randomUUID().toString();
      reportingId = UUID.randomUUID().toString();
      dashboardsWatcherA = watching("dashboards-a", TENANT_A, StreamTopic.LIST_DASHBOARDS);
      dashboardsWatcherB = watching("dashboards-b", TENANT_B, StreamTopic.LIST_DASHBOARDS);
      dashboardWatcherA = watching("dashboard-a", TENANT_A, StreamTopic.dashboard(dashboardId));
      reportsWatcherA = watching("reports-a", TENANT_A, StreamTopic.LIST_REPORTS);
      reportsWatcherB = watching("reports-b", TENANT_B, StreamTopic.LIST_REPORTS);
      reportWatcherA = watching("report-a", TENANT_A, StreamTopic.report(reportingId));
      analyticsWatcherA = watching("analytics-a", TENANT_A, StreamTopic.LIST_ANALYTICS);
      analyticsWatcherB = watching("analytics-b", TENANT_B, StreamTopic.LIST_ANALYTICS);
    }

    @AfterEach
    void tearDown() {
      TenantContext.clearCurrentTenant();
    }

    private StreamConnection watching(String id, String tenantId, StreamTopic topic) {
      StreamConnection socket = connection(id, tenantId);
      registry.register(socket);
      registry.replaceTopics(socket, Set.of(topic));
      return socket;
    }

    private void assertSent(StreamConnection socket, StreamTopic topic) throws IOException {
      verify(socket.session()).sendMessage(new TextMessage(StreamMessages.invalidate(topic)));
    }

    private static void assertSilent(StreamConnection... sockets) throws IOException {
      for (StreamConnection socket : sockets) {
        verify(socket.session(), never()).sendMessage(any());
      }
    }

    private CustomDashboard dashboard() {
      CustomDashboard dashboard = new CustomDashboard();
      dashboard.setId(dashboardId);
      dashboard.setTenant(new Tenant(TENANT_A));
      return dashboard;
    }

    @ParameterizedTest
    @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
    @DisplayName("a custom dashboard reaches its own tenant's list and its screen")
    void given_dashboard_should_invalidateOwnTenantListAndScreen(String type) throws IOException {
      // Act
      listener.onDatabaseUpdate(event(type, dashboard()));
      buffer.drain();

      // Assert
      assertSent(dashboardsWatcherA, StreamTopic.LIST_DASHBOARDS);
      assertSent(dashboardWatcherA, StreamTopic.dashboard(dashboardId));
      assertSilent(dashboardsWatcherB, reportsWatcherA, analyticsWatcherA, socketA, socketB);
    }

    @ParameterizedTest
    @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
    @DisplayName("a widget of a dashboard proxy reaches the dashboard, loading nothing")
    void given_widgetOfDashboardProxy_should_invalidateDashboard(String type) throws IOException {
      // Arrange
      CustomDashboard dashboardProxy = proxy(CustomDashboard.class, dashboardId);
      Widget widget = new Widget();
      widget.setId(UUID.randomUUID().toString());
      widget.setTenant(new Tenant(TENANT_A));
      widget.setCustomDashboard(dashboardProxy);

      // Act
      listener.onDatabaseUpdate(event(type, widget));
      buffer.drain();

      // Assert
      assertSent(dashboardsWatcherA, StreamTopic.LIST_DASHBOARDS);
      assertSent(dashboardWatcherA, StreamTopic.dashboard(dashboardId));
      assertSilent(dashboardsWatcherB);
      verify(dashboardProxy, never()).getTenant();
    }

    @Test
    @DisplayName("dashboard parameters reach their loaded dashboard's tenant")
    void given_parametersOfLoadedDashboard_should_invalidateDashboardTenant() throws IOException {
      // Arrange
      TenantContext.setCurrentTenant(TENANT_B);
      CustomDashboardParameters parameters = new CustomDashboardParameters();
      parameters.setId(UUID.randomUUID().toString());
      parameters.setCustomDashboard(dashboard());

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, parameters));
      buffer.drain();

      // Assert
      assertSent(dashboardsWatcherA, StreamTopic.LIST_DASHBOARDS);
      assertSent(dashboardWatcherA, StreamTopic.dashboard(dashboardId));
      assertSilent(dashboardsWatcherB);
    }

    @Test
    @DisplayName("dashboard parameters of a proxy reach the thread tenant, loading nothing")
    void given_parametersOfDashboardProxy_should_invalidateThreadTenant() throws IOException {
      // Arrange
      TenantContext.setCurrentTenant(TENANT_B);
      CustomDashboard dashboardProxy = proxy(CustomDashboard.class, dashboardId);
      CustomDashboardParameters parameters = new CustomDashboardParameters();
      parameters.setId(UUID.randomUUID().toString());
      parameters.setCustomDashboard(dashboardProxy);

      // Act
      listener.onDatabaseUpdate(event(DATA_PERSIST, parameters));
      buffer.drain();

      // Assert: the screen is recorded wherever it is watched (only in its own tenant)
      assertSent(dashboardsWatcherB, StreamTopic.LIST_DASHBOARDS);
      assertSent(dashboardWatcherA, StreamTopic.dashboard(dashboardId));
      assertSilent(dashboardsWatcherA);
      verify(dashboardProxy, never()).getTenant();
    }

    @ParameterizedTest
    @ValueSource(strings = {DATA_PERSIST, DATA_UPDATE, DATA_DELETE})
    @DisplayName("a reporting reaches its own tenant's list and its page")
    void given_reporting_should_invalidateOwnTenantListAndPage(String type) throws IOException {
      // Arrange
      Reporting reporting = new Reporting();
      reporting.setId(reportingId);
      reporting.setTenant(new Tenant(TENANT_A));

      // Act
      listener.onDatabaseUpdate(event(type, reporting));
      buffer.drain();

      // Assert
      assertSent(reportsWatcherA, StreamTopic.LIST_REPORTS);
      assertSent(reportWatcherA, StreamTopic.report(reportingId));
      assertSilent(reportsWatcherB, dashboardsWatcherA, analyticsWatcherA);
    }

    @Test
    @DisplayName("a generation or schedule of a reporting proxy reaches its page, loading nothing")
    void given_generationAndSchedule_should_invalidateReportingPage() throws IOException {
      // Arrange: the rendering job saves the generation status through JPA
      Reporting reportingProxy = proxy(Reporting.class, reportingId);
      ReportingGeneration generation = new ReportingGeneration();
      generation.setId(UUID.randomUUID().toString());
      generation.setTenant(new Tenant(TENANT_A));
      generation.setReporting(reportingProxy);
      ReportingSchedule schedule = new ReportingSchedule();
      schedule.setId(UUID.randomUUID().toString());
      schedule.setTenant(new Tenant(TENANT_A));
      schedule.setReporting(reportingProxy);

      // Act
      listener.onDatabaseUpdate(event(DATA_UPDATE, generation));
      buffer.drain();
      clock.advance(Duration.ofSeconds(2));
      listener.onDatabaseUpdate(event(DATA_PERSIST, schedule));
      buffer.drain();

      // Assert
      verify(reportsWatcherA.session(), times(2))
          .sendMessage(new TextMessage(StreamMessages.invalidate(StreamTopic.LIST_REPORTS)));
      verify(reportWatcherA.session(), times(2))
          .sendMessage(new TextMessage(StreamMessages.invalidate(StreamTopic.report(reportingId))));
      assertSilent(reportsWatcherB);
      verify(reportingProxy, never()).getTenant();
    }

    @Test
    @DisplayName("indexed documents reach list:analytics of their tenants only")
    void given_analyticsIndexedForTenant_should_invalidateThatTenant() throws IOException {
      // Act
      listener.onAnalyticsIndexed(new AnalyticsIndexedEvent(Set.of(TENANT_A)));
      buffer.drain();

      // Assert
      assertSent(analyticsWatcherA, StreamTopic.LIST_ANALYTICS);
      assertSilent(analyticsWatcherB, dashboardsWatcherA, reportsWatcherA, socketA);
    }

    @Test
    @DisplayName("documents of unknown tenants reach list:analytics of every watching tenant")
    void given_analyticsIndexedEverywhere_should_invalidateEveryTenant() throws IOException {
      // Act
      listener.onAnalyticsIndexed(AnalyticsIndexedEvent.everyTenant());
      buffer.drain();

      // Assert
      assertSent(analyticsWatcherA, StreamTopic.LIST_ANALYTICS);
      assertSent(analyticsWatcherB, StreamTopic.LIST_ANALYTICS);
      assertSilent(dashboardsWatcherA, reportsWatcherB, socketB);
    }

    @Test
    @DisplayName("a burst of indexing rounds reaches each tenant once per interval")
    void given_burstOfIndexingRounds_should_invalidateOncePerInterval() throws IOException {
      // Act: several models index documents of the tenant within the same interval
      for (int i = 0; i < 10; i++) {
        listener.onAnalyticsIndexed(new AnalyticsIndexedEvent(Set.of(TENANT_A)));
        buffer.drain();
        clock.advance(Duration.ofMillis(100));
      }

      // Assert
      verify(analyticsWatcherA.session(), times(1))
          .sendMessage(new TextMessage(StreamMessages.invalidate(StreamTopic.LIST_ANALYTICS)));
    }

    @Test
    @DisplayName("a native delete reaches the watched screens, and the thread tenant's lists")
    void given_indexDelete_should_invalidateWatchedScreensAndThreadTenantLists()
        throws IOException {
      // Arrange
      TenantContext.setCurrentTenant(TENANT_A);

      // Act
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, dashboardId));
      listener.onIndexDelete(new IndexEvent(DATA_DELETE, reportingId));
      buffer.drain();

      // Assert: list:analytics waits for the engine delete itself
      assertSent(dashboardWatcherA, StreamTopic.dashboard(dashboardId));
      assertSent(reportWatcherA, StreamTopic.report(reportingId));
      assertSent(dashboardsWatcherA, StreamTopic.LIST_DASHBOARDS);
      assertSent(reportsWatcherA, StreamTopic.LIST_REPORTS);
      assertSilent(dashboardsWatcherB, reportsWatcherB, analyticsWatcherA);
    }
  }
}
