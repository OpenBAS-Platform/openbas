package io.openaev.stream;

import io.openaev.context.TenantContext;
import io.openaev.database.audit.AnalyticsIndexedEvent;
import io.openaev.database.audit.BaseEvent;
import io.openaev.database.audit.FindingWrittenEvent;
import io.openaev.database.audit.IndexEvent;
import io.openaev.database.audit.ModelBaseListener;
import io.openaev.database.model.Agent;
import io.openaev.database.model.Article;
import io.openaev.database.model.Asset;
import io.openaev.database.model.AssetGroup;
import io.openaev.database.model.Base;
import io.openaev.database.model.BaseInjectExpectation;
import io.openaev.database.model.CatalogConnector;
import io.openaev.database.model.Challenge;
import io.openaev.database.model.ChallengeFlag;
import io.openaev.database.model.Channel;
import io.openaev.database.model.Collector;
import io.openaev.database.model.Comcheck;
import io.openaev.database.model.ComcheckStatus;
import io.openaev.database.model.Communication;
import io.openaev.database.model.ConnectorInstanceConfiguration;
import io.openaev.database.model.ConnectorInstanceLog;
import io.openaev.database.model.ConnectorInstancePersisted;
import io.openaev.database.model.CredentialSecretReference;
import io.openaev.database.model.CustomDashboard;
import io.openaev.database.model.CustomDashboardParameters;
import io.openaev.database.model.DetectionRemediation;
import io.openaev.database.model.Document;
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
import io.openaev.database.model.TechnicalInjectExpectation;
import io.openaev.database.model.Tenant;
import io.openaev.database.model.TenantBase;
import io.openaev.database.model.User;
import io.openaev.database.model.Variable;
import io.openaev.database.model.Widget;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.function.Function;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.hibernate.proxy.HibernateProxy;
import org.hibernate.proxy.LazyInitializer;
import org.springframework.context.event.EventListener;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Turns committed changes into invalidations:
 *
 * <ul>
 *   <li>a {@link Scenario} → {@code list:scenarios} of its tenant and {@code scenario:<id>};
 *   <li>a scenario's {@link Inject}, a simulation (or a simulation's inject or finding) of a
 *       scenario, and a scenario's article, variable, objective, lessons category or question →
 *       {@code scenario:<scenarioId>};
 *   <li>a {@link Team} or {@link Document} whose scenarios are already loaded → {@code
 *       scenario:<id>} of each (a lazy, unloaded collection is not read, so nothing is sent);
 *   <li>a simulation ({@link Exercise}) → {@code list:simulations} of its tenant and {@code
 *       simulation:<id>};
 *   <li>a simulation's {@link Inject} or expectation → {@code simulation:<exerciseId>} and {@code
 *       list:simulations} (the list shows the targets and the global score);
 *   <li>a simulation's finding, article, variable, objective, evaluation, lessons category,
 *       question or answer, log, comcheck (or its status) and communication, and a {@link Team} or
 *       {@link Document} whose simulations are already loaded → {@code simulation:<exerciseId>};
 *   <li>an atomic-testing {@link Inject} (created, updated, deleted, or its status changed through
 *       {@code InjectStatusService}, which publishes the inject) → {@code list:atomic-testings} of
 *       its tenant and {@code atomic-testing:<id>};
 *   <li>an expectation of an atomic testing → {@code atomic-testing:<injectId>} and {@code
 *       list:atomic-testings} (the list shows the global score);
 *   <li>a {@link Finding} of an atomic testing → {@code atomic-testing:<injectId>};
 *   <li>an {@link Asset} (an endpoint, an AI target or any other inventory asset; not a {@link
 *       SecurityPlatform}, which has its own inventory and rights) → {@code list:assets} and {@code
 *       list:asset-groups} of its tenant (a group's members include the assets its dynamic filter
 *       matches), {@code asset:<id>} and {@code asset-group:<id>} of its loaded groups;
 *   <li>an {@link Agent} (registration, heartbeat, inactivity) → {@code list:assets} of its tenant
 *       (the list shows the agents and the activity status) and {@code asset:<endpointId>};
 *   <li>an {@link AssetGroup} → {@code list:asset-groups} of its tenant, {@code asset-group:<id>}
 *       and {@code asset:<id>} of its loaded static members (an asset's screen shows its groups);
 *   <li>a {@link Finding} → also {@code list:findings} of its tenant, {@code finding:<id>} and
 *       {@code asset:<id>} of its loaded assets;
 *   <li>an inject → also {@code asset:<id>} and {@code asset-group:<id>} of its loaded targets
 *       (their screens list the injects played on them), and a technical expectation → {@code
 *       asset:<id>} and {@code asset-group:<id>} of its target, read from the proxies (posture);
 *   <li>a {@link Team} → also {@code list:teams} of its tenant, {@code team:<id>}, {@code
 *       person:<id>} of its loaded members and {@code organization:<id>} of its organization;
 *   <li>a {@link User} (platform-level, in its tenants through {@code users_tenants}) → {@code
 *       list:persons} of its loaded tenants and of the committing thread's tenant, {@code
 *       person:<id>}, {@code team:<id>} of its loaded teams and {@code organization:<id>} of its
 *       organization;
 *   <li>an {@link Organization} → {@code list:organizations} of its tenant and {@code
 *       organization:<id>};
 *   <li>an {@link Injector}, {@link InjectorContract}, {@link Collector}, {@link Executor} or
 *       {@link ConnectorInstancePersisted connector instance} (with its configurations and logs) →
 *       {@code list:integrations} of its tenant; a {@link CatalogConnector}, platform-level, →
 *       {@code list:integrations} of every tenant watching it;
 *   <li>an {@link InjectorContract} (a threat arsenal entry, payload-based or native) → also {@code
 *       list:payloads} of its tenant and {@code payload:<contractId>} in that tenant; a {@link
 *       Payload} (any payload type) or {@link DetectionRemediation} → {@code list:payloads} only, a
 *       payload not knowing its contract without a query (a payload save also saves its contract,
 *       which reaches the screen);
 *   <li>a {@link CredentialSecretReference credential} → {@code list:credentials} of its tenant and
 *       {@code credential:<id>};
 *   <li>a {@link Document} → also {@code list:components} of its tenant, like a {@link Channel},
 *       {@link Challenge} (and its flags), {@link PhishingLandingPage}, {@link
 *       PhishingEmailTemplate} and {@link LessonsTemplate} (and its categories and questions);
 *   <li>a {@link CustomDashboard}, or one of its {@link Widget widgets} or {@link
 *       CustomDashboardParameters parameters} → {@code list:dashboards} of its tenant and {@code
 *       dashboard:<dashboardId>} (the dashboard id from the child's proxy);
 *   <li>a {@link Reporting}, or one of its {@link ReportingGeneration generations} (including the
 *       status updates of the rendering job, saved through JPA) or {@link ReportingSchedule
 *       schedules} → {@code list:reports} of its tenant and {@code report:<reportingId>};
 *   <li>an {@link AnalyticsIndexedEvent} (the search engine indexed or removed documents) → {@code
 *       list:analytics} of the documents' tenants, or of every tenant watching it;
 *   <li>a native delete announced by an {@link IndexEvent} → {@code atomic-testing:<id>}, {@code
 *       scenario:<id>}, {@code simulation:<id>}, {@code asset:<id>}, {@code asset-group:<id>},
 *       {@code finding:<id>}, {@code team:<id>}, {@code person:<id>}, {@code organization:<id>},
 *       {@code payload:<id>}, {@code credential:<id>}, {@code dashboard:<id>} and {@code
 *       report:<id>}, if someone watches them.
 * </ul>
 *
 * <p>It reads the entity's own {@code isListened()} rather than the event's {@code listened} flag:
 * the latter also folds in {@code BulkOperationContext}, which suppresses per-entity events for the
 * SSE stream during bulk operations, whereas a bulk delete must still invalidate the list (the
 * buffer collapses the whole bulk into one message per interval). Credentials are the exception:
 * secret references are never listened, to keep them out of the SSE stream, but an invalidation
 * carries no data, so they are streamed regardless.
 *
 * <p>It runs on the committing thread after the commit, outside any session, and must never load:
 * lazy associations are only read for their id (from the proxy), and a fact that would need a load
 * is replaced by over-invalidation; a scenario id that cannot be read without a load (an unloaded
 * collection or lessons category) leaves nothing to invalidate, so that change is not streamed. An
 * entity topic does not need its tenant: it is recorded in the tenants watching it, which the
 * authorizer limits to the row's own tenant. Nothing it does may reach the request: any failure is
 * counted and logged.
 */
@Slf4j
public class StreamInvalidationListener {

  private final StreamInvalidationBuffer buffer;
  private final StreamMetrics metrics;

  public StreamInvalidationListener(StreamInvalidationBuffer buffer, StreamMetrics metrics) {
    this.buffer = buffer;
    this.metrics = metrics;
  }

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void onDatabaseUpdate(BaseEvent event) {
    try {
      Base instance = event.getInstance();
      // An uninitialized proxy would load on any call, isListened() included.
      if (instance == null || !Hibernate.isInitialized(instance)) {
        return;
      }
      if (instance instanceof CredentialSecretReference credential) {
        // Secret references opt out of isListened() so that the SSE stream, which carries the
        // entity, never sees them; an invalidation carries only the topic.
        onCredential(credential);
        return;
      }
      if (!instance.isListened()) {
        return;
      }
      switch (instance) {
        case Scenario scenario -> onScenario(scenario);
        case Inject inject -> onInject(inject);
        case BaseInjectExpectation expectation -> onExpectation(expectation);
        case Finding finding -> onFinding(finding);
        case SecurityPlatform ignored -> {
          // Its own inventory and rights: not one of the assets of list:assets.
        }
        case Asset asset -> onAsset(asset);
        case Agent agent -> onAgent(agent);
        case AssetGroup assetGroup -> onAssetGroup(assetGroup);
        case Exercise simulation -> onSimulation(simulation);
        case Article article -> recordParents(article.getScenario(), article.getExercise());
        case Variable variable -> recordParents(variable.getScenario(), variable.getExercise());
        case Objective objective -> recordParents(objective.getScenario(), objective.getExercise());
        case Evaluation evaluation -> onEvaluation(evaluation);
        case LessonsCategory category -> onLessonsCategory(category);
        case LessonsQuestion question -> onLessonsCategory(question.getCategory());
        case LessonsAnswer answer -> onLessonsAnswer(answer);
        case Log entry -> recordSimulation(idOf(entry.getExercise()));
        case Comcheck comcheck -> recordSimulation(idOf(comcheck.getExercise()));
        case ComcheckStatus status -> onComcheckStatus(status);
        case Communication communication -> onCommunication(communication);
        case Team team -> onTeam(team);
        case User user -> onUser(user);
        case Organization organization -> onOrganization(organization);
        case Injector injector -> recordList(injector.getTenantId(), StreamTopic.LIST_INTEGRATIONS);
        case InjectorContract contract -> onInjectorContract(contract);
        case Payload payload -> recordList(idOf(payload.getTenant()), StreamTopic.LIST_PAYLOADS);
        case DetectionRemediation remediation -> onPayloadChild(remediation.getPayload());
        case Collector collector ->
            recordList(collector.getTenantId(), StreamTopic.LIST_INTEGRATIONS);
        case Executor executor -> recordList(executor.getTenantId(), StreamTopic.LIST_INTEGRATIONS);
        case ConnectorInstancePersisted connectorInstance ->
            recordList(idOf(connectorInstance.getTenant()), StreamTopic.LIST_INTEGRATIONS);
        case ConnectorInstanceConfiguration configuration ->
            onConnectorInstanceChild(configuration.getConnectorInstance());
        case ConnectorInstanceLog entry -> onConnectorInstanceChild(entry.getConnectorInstance());
        case CatalogConnector ignored -> buffer.recordInEveryTenant(StreamTopic.LIST_INTEGRATIONS);
        case Document document -> {
          recordEach(document.getScenarios(), StreamTopic::scenario);
          recordEach(document.getExercises(), StreamTopic::simulation);
          recordList(idOf(document.getTenant()), StreamTopic.LIST_COMPONENTS);
        }
        case Channel channel -> recordList(idOf(channel.getTenant()), StreamTopic.LIST_COMPONENTS);
        case Challenge challenge ->
            recordList(idOf(challenge.getTenant()), StreamTopic.LIST_COMPONENTS);
        case ChallengeFlag flag -> onComponentChild(flag.getChallenge());
        case PhishingLandingPage page ->
            recordList(idOf(page.getTenant()), StreamTopic.LIST_COMPONENTS);
        case PhishingEmailTemplate template ->
            recordList(idOf(template.getTenant()), StreamTopic.LIST_COMPONENTS);
        case LessonsTemplate template ->
            recordList(idOf(template.getTenant()), StreamTopic.LIST_COMPONENTS);
        case LessonsTemplateCategory category -> onComponentChild(category.getTemplate());
        case LessonsTemplateQuestion question -> onLessonsTemplateQuestion(question);
        case CustomDashboard dashboard -> onDashboard(dashboard.getTenant(), dashboard.getId());
        case Widget widget -> onDashboard(widget.getTenant(), idOf(widget.getCustomDashboard()));
        case CustomDashboardParameters parameters -> onDashboardParameters(parameters);
        case Reporting reporting -> onReport(reporting.getTenant(), reporting.getId());
        case ReportingGeneration generation ->
            onReport(generation.getTenant(), idOf(generation.getReporting()));
        case ReportingSchedule schedule ->
            onReport(schedule.getTenant(), idOf(schedule.getReporting()));
        default -> {
          // Not streamed.
        }
      }
    } catch (RuntimeException e) {
      metrics.listenerFailure();
      log.warn("Stream invalidation listener failed: {}", e.getMessage(), e);
    }
  }

  /**
   * Bulk and relaunch deletes of injects are native: no {@link BaseEvent} fires, only this index
   * event carrying the id. The id may name any entity, but an entity topic with no watcher records
   * nothing, so only a watched atomic testing, scenario or simulation is invalidated (its screen
   * then reads a 404). A native delete of a scenario's or simulation's inject carries only the
   * inject id, so the parent's screen does not learn it.
   *
   * <p>The event does not say what was deleted, so the lists of the committing thread's tenant are
   * all invalidated: a simulation delete, a bulk delete of atomic testings and an endpoint delete
   * are native too. Without a thread tenant (a background job), only the watched screens learn it.
   */
  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void onIndexDelete(IndexEvent event) {
    try {
      if (ModelBaseListener.DATA_DELETE.equals(event.getType()) && event.getId() != null) {
        buffer.recordWherever(StreamTopic.atomicTesting(event.getId()));
        buffer.recordWherever(StreamTopic.scenario(event.getId()));
        buffer.recordWherever(StreamTopic.simulation(event.getId()));
        buffer.recordWherever(StreamTopic.asset(event.getId()));
        buffer.recordWherever(StreamTopic.assetGroup(event.getId()));
        buffer.recordWherever(StreamTopic.finding(event.getId()));
        buffer.recordWherever(StreamTopic.team(event.getId()));
        buffer.recordWherever(StreamTopic.person(event.getId()));
        buffer.recordWherever(StreamTopic.organization(event.getId()));
        buffer.recordWherever(StreamTopic.payload(event.getId()));
        buffer.recordWherever(StreamTopic.credential(event.getId()));
        buffer.recordWherever(StreamTopic.dashboard(event.getId()));
        buffer.recordWherever(StreamTopic.report(event.getId()));
        String tenantId = tenantIdOf(null);
        recordList(tenantId, StreamTopic.LIST_ATOMIC_TESTINGS);
        recordList(tenantId, StreamTopic.LIST_SCENARIOS);
        recordList(tenantId, StreamTopic.LIST_SIMULATIONS);
        recordList(tenantId, StreamTopic.LIST_ASSETS);
        recordList(tenantId, StreamTopic.LIST_ASSET_GROUPS);
        recordList(tenantId, StreamTopic.LIST_FINDINGS);
        recordList(tenantId, StreamTopic.LIST_TEAMS);
        recordList(tenantId, StreamTopic.LIST_PERSONS);
        recordList(tenantId, StreamTopic.LIST_ORGANIZATIONS);
        recordList(tenantId, StreamTopic.LIST_INTEGRATIONS);
        recordList(tenantId, StreamTopic.LIST_PAYLOADS);
        recordList(tenantId, StreamTopic.LIST_CREDENTIALS);
        recordList(tenantId, StreamTopic.LIST_COMPONENTS);
        recordList(tenantId, StreamTopic.LIST_DASHBOARDS);
        recordList(tenantId, StreamTopic.LIST_REPORTS);
      }
    } catch (RuntimeException e) {
      metrics.listenerFailure();
      log.warn("Stream invalidation listener failed: {}", e.getMessage(), e);
    }
  }

  /**
   * A finding written natively during an execution: the findings list of its tenant, its screen,
   * the asset it was found on and, when watched, the atomic testing that produced it. A simulation
   * or scenario findings tab is not reached: the inject's parent is unknown without a load.
   */
  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void onFindingWritten(FindingWrittenEvent event) {
    try {
      recordList(event.tenantId(), StreamTopic.LIST_FINDINGS);
      if (event.findingId() != null) {
        buffer.recordWherever(StreamTopic.finding(event.findingId()));
      }
      if (event.assetId() != null) {
        buffer.recordWherever(StreamTopic.asset(event.assetId()));
      }
      if (event.injectId() != null) {
        buffer.recordWherever(StreamTopic.atomicTesting(event.injectId()));
      }
    } catch (RuntimeException e) {
      metrics.listenerFailure();
      log.warn("Stream invalidation listener failed: {}", e.getMessage(), e);
    }
  }

  /**
   * The search engine indexed or removed documents: every widget data query of their tenants is
   * stale. The indexing loop publishes this outside the JPA listener chain and outside any
   * committed-change semantics (the engine write has already happened), hence a plain listener
   * rather than an after-commit one. A document without a tenant, or a delete whose tenant is
   * unknown, reaches every tenant watching the topic, each socket having passed the check in its
   * own tenant; the buffer paces it like any other topic.
   */
  @EventListener
  public void onAnalyticsIndexed(AnalyticsIndexedEvent event) {
    try {
      if (event.isEveryTenant()) {
        buffer.recordInEveryTenant(StreamTopic.LIST_ANALYTICS);
        return;
      }
      event.tenantIds().forEach(tenantId -> recordList(tenantId, StreamTopic.LIST_ANALYTICS));
    } catch (RuntimeException e) {
      metrics.listenerFailure();
      log.warn("Stream invalidation listener failed: {}", e.getMessage(), e);
    }
  }

  private void onScenario(Scenario scenario) {
    recordScenario(scenario.getId());
    // The tenant is an eager association, readable after the commit like StreamApi does.
    recordList(idOf(scenario.getTenant()), StreamTopic.LIST_SCENARIOS);
  }

  /** A simulation: its screen, its tenant's list (eager tenant) and the scenario it came from. */
  private void onSimulation(Exercise simulation) {
    recordSimulation(simulation.getId());
    recordList(idOf(simulation.getTenant()), StreamTopic.LIST_SIMULATIONS);
    recordScenario(scenarioIdOf(simulation));
  }

  private void onInject(Inject inject) {
    // exercise and scenario are eager: the null checks behind isAtomicTesting() load nothing.
    if (!Hibernate.isInitialized(inject) || inject.getId() == null) {
      return;
    }
    // The screens of its targets list the injects played on them; lazy targets are not read.
    recordEach(inject.getAssets(), StreamTopic::asset);
    recordEach(inject.getAssetGroups(), StreamTopic::assetGroup);
    if (!inject.isAtomicTesting()) {
      recordScenario(scenarioIdOf(inject));
      if (inject.getExercise() != null) {
        // A simulation's list shows its targets and global score, both computed from its injects.
        recordSimulation(idOf(inject.getExercise()));
        recordList(idOf(inject.getTenant()), StreamTopic.LIST_SIMULATIONS);
      }
      return;
    }
    buffer.recordWherever(StreamTopic.atomicTesting(inject.getId()));
    recordList(idOf(inject.getTenant()), StreamTopic.LIST_ATOMIC_TESTINGS);
  }

  /**
   * An expectation has no tenant column and a lazy inject. A simulation's expectation carries its
   * exercise (lazy too, but its id is read from the proxy without loading) and goes to that
   * simulation's screen and list; one without is taken for an atomic testing's unless its inject is
   * loaded and says otherwise. The list's tenant comes from the loaded inject or, failing that,
   * from the committing thread's tenant.
   */
  private void onExpectation(BaseInjectExpectation expectation) {
    if (expectation instanceof TechnicalInjectExpectation technical) {
      // The posture and expectations of an asset or asset group screen; ids from the proxies.
      recordEntity(idOf(technical.getAsset()), StreamTopic::asset);
      recordEntity(idOf(technical.getAssetGroup()), StreamTopic::assetGroup);
    }
    Inject inject = expectation.getInject();
    boolean loaded = inject != null && Hibernate.isInitialized(inject);
    String simulationId = idOf(expectation.getExercise());
    if (simulationId == null && loaded) {
      simulationId = idOf(inject.getExercise());
    }
    if (simulationId != null) {
      recordSimulation(simulationId);
      recordList(tenantIdOf(loaded ? inject : null), StreamTopic.LIST_SIMULATIONS);
      return;
    }
    if (inject == null || (loaded && !inject.isAtomicTesting())) {
      return;
    }
    String injectId = idOf(inject);
    if (injectId == null) {
      return;
    }
    buffer.recordWherever(StreamTopic.atomicTesting(injectId));
    recordList(tenantIdOf(loaded ? inject : null), StreamTopic.LIST_ATOMIC_TESTINGS);
  }

  /** The tenant of a loaded inject, or the committing thread's tenant when it is not loaded. */
  private static String tenantIdOf(Inject loadedInject) {
    if (loadedInject != null) {
      return idOf(loadedInject.getTenant());
    }
    return TenantContext.hasCurrentTenant() ? TenantContext.getCurrentTenant() : null;
  }

  /**
   * A finding: the global list of its tenant (eager), its screen, and the screens of its assets
   * when they are loaded; then the screens of the inject it came from.
   */
  private void onFinding(Finding finding) {
    recordEntity(finding.getId(), StreamTopic::finding);
    recordList(idOf(finding.getTenant()), StreamTopic.LIST_FINDINGS);
    recordEach(finding.getAssets(), StreamTopic::asset);
    Inject inject = finding.getInject();
    if (inject == null) {
      return;
    }
    if (Hibernate.isInitialized(inject) && !inject.isAtomicTesting()) {
      // The scenario's findings tab lists the findings of its simulations' injects.
      recordScenario(scenarioIdOf(inject));
      recordSimulation(idOf(inject.getExercise()));
      return;
    }
    String injectId = idOf(inject);
    if (injectId != null) {
      buffer.recordWherever(StreamTopic.atomicTesting(injectId));
    }
  }

  /**
   * An asset of the inventory: its screen, its tenant's lists (eager tenant) and the screens of its
   * groups when they are loaded. The asset-group list is invalidated too, since dynamic members are
   * computed from the asset's attributes; which groups' screens that changes is unknown without
   * evaluating their filters, so they are not invalidated.
   */
  private void onAsset(Asset asset) {
    recordEntity(asset.getId(), StreamTopic::asset);
    String tenantId = idOf(asset.getTenant());
    recordList(tenantId, StreamTopic.LIST_ASSETS);
    recordList(tenantId, StreamTopic.LIST_ASSET_GROUPS);
    recordEach(asset.getAssetGroups(), StreamTopic::assetGroup);
  }

  /**
   * An agent: the screen of its endpoint (a to-one whose id comes from the proxy) and its tenant's
   * asset list, which shows each endpoint's agents and activity status.
   */
  private void onAgent(Agent agent) {
    recordEntity(idOf(agent.getAsset()), StreamTopic::asset);
    recordList(idOf(agent.getTenant()), StreamTopic.LIST_ASSETS);
  }

  /** An asset group: its screen, its tenant's list and the screens of its loaded static members. */
  private void onAssetGroup(AssetGroup assetGroup) {
    recordEntity(assetGroup.getId(), StreamTopic::assetGroup);
    recordList(idOf(assetGroup.getTenant()), StreamTopic.LIST_ASSET_GROUPS);
    recordEach(assetGroup.getAssets(), StreamTopic::asset);
  }

  /**
   * A team: the scenarios and simulations it is loaded with, its tenant's list (eager tenant), its
   * screen, the screens of its loaded members (a person's screen shows its teams) and its
   * organization's screen (id from the proxy). Membership is saved through the team, so a member
   * removed by that save is no longer in the collection and its screen is not reached.
   */
  private void onTeam(Team team) {
    recordEach(team.getScenarios(), StreamTopic::scenario);
    recordEach(team.getExercises(), StreamTopic::simulation);
    recordEntity(team.getId(), StreamTopic::team);
    recordList(idOf(team.getTenant()), StreamTopic.LIST_TEAMS);
    recordEach(team.getUsers(), StreamTopic::person);
    recordEntity(idOf(team.getOrganization()), StreamTopic::organization);
  }

  /**
   * A user, shown as a person in each tenant it belongs to. Users are platform-level: the persons
   * list is invalidated in the tenants of its {@code users_tenants} collection when it is loaded,
   * plus the committing thread's tenant (where the change was made, and which a user just detached
   * from is no longer in). Other tenants are not told, rather than told about a change in a tenant
   * they do not share. Its screen, its loaded teams' screens and its organization's screen follow.
   */
  private void onUser(User user) {
    recordEntity(user.getId(), StreamTopic::person);
    Set<String> tenantIds = new LinkedHashSet<>();
    if (user.getTenants() != null && Hibernate.isInitialized(user.getTenants())) {
      for (Tenant tenant : user.getTenants()) {
        String tenantId = idOf(tenant);
        if (tenantId != null) {
          tenantIds.add(tenantId);
        }
      }
    }
    String threadTenantId = tenantIdOf(null);
    if (threadTenantId != null) {
      tenantIds.add(threadTenantId);
    }
    tenantIds.forEach(tenantId -> recordList(tenantId, StreamTopic.LIST_PERSONS));
    recordEach(user.getTeams(), StreamTopic::team);
    recordEntity(idOf(user.getOrganization()), StreamTopic::organization);
  }

  /** An organization: its tenant's list (eager tenant) and its screen. */
  private void onOrganization(Organization organization) {
    recordEntity(organization.getId(), StreamTopic::organization);
    recordList(idOf(organization.getTenant()), StreamTopic.LIST_ORGANIZATIONS);
  }

  /**
   * An injector contract is both an integration and a threat arsenal entry, whose screen is named
   * by the contract id (the {@code action_id}). Contract ids repeat across tenants (built-in
   * contracts), so its screen is recorded in its own tenant (read from the composite id, no load).
   */
  private void onInjectorContract(InjectorContract contract) {
    String tenantId = idOf(contract.getTenant());
    recordList(tenantId, StreamTopic.LIST_INTEGRATIONS);
    recordList(tenantId, StreamTopic.LIST_PAYLOADS);
    if (contract.getId() != null) {
      StreamTopic topic = StreamTopic.payload(contract.getId());
      if (tenantId != null) {
        buffer.record(tenantId, topic);
      } else {
        buffer.recordWherever(topic);
      }
    }
  }

  /**
   * A child of a payload (a detection remediation) has no tenant of its own: the threat arsenal of
   * the payload's tenant when the payload is loaded, otherwise of the committing thread's tenant.
   * The entry's screen is not reached: the payload does not reference its contract.
   */
  private void onPayloadChild(Payload payload) {
    if (payload == null) {
      return;
    }
    recordList(tenantIdOfParent(payload), StreamTopic.LIST_PAYLOADS);
  }

  /**
   * A custom dashboard or a widget (both with an eager tenant): its tenant's dashboards list and
   * the dashboard's definition screen, the widget's dashboard id coming from the proxy.
   */
  private void onDashboard(Tenant tenant, String dashboardId) {
    recordList(idOf(tenant), StreamTopic.LIST_DASHBOARDS);
    recordEntity(dashboardId, StreamTopic::dashboard);
  }

  /**
   * Dashboard parameters have no tenant of their own: the dashboards list of the dashboard's tenant
   * when it is loaded, otherwise of the committing thread's tenant; the dashboard id comes from the
   * proxy.
   */
  private void onDashboardParameters(CustomDashboardParameters parameters) {
    CustomDashboard dashboard = parameters.getCustomDashboard();
    if (dashboard == null) {
      return;
    }
    recordList(tenantIdOfParent(dashboard), StreamTopic.LIST_DASHBOARDS);
    recordEntity(idOf(dashboard), StreamTopic::dashboard);
  }

  /**
   * A reporting, or a generation or schedule of one (each with an eager tenant): its tenant's
   * reports list and the reporting's page, the reporting id coming from the proxy.
   */
  private void onReport(Tenant tenant, String reportingId) {
    recordList(idOf(tenant), StreamTopic.LIST_REPORTS);
    recordEntity(reportingId, StreamTopic::report);
  }

  /** A credential: its screen and its tenant's list (eager tenant). */
  private void onCredential(CredentialSecretReference credential) {
    recordEntity(credential.getId(), StreamTopic::credential);
    recordList(idOf(credential.getTenant()), StreamTopic.LIST_CREDENTIALS);
  }

  /**
   * A child of a component (a challenge flag, a lessons template category) has no tenant of its
   * own: the components list of its parent's tenant when the parent is loaded, otherwise of the
   * committing thread's tenant.
   */
  private void onComponentChild(TenantBase parent) {
    if (parent != null) {
      recordList(tenantIdOfParent(parent), StreamTopic.LIST_COMPONENTS);
    }
  }

  /** A lessons template question reaches its template through its category, when it is loaded. */
  private void onLessonsTemplateQuestion(LessonsTemplateQuestion question) {
    LessonsTemplateCategory category = question.getCategory();
    if (category == null) {
      return;
    }
    if (Hibernate.isInitialized(category)) {
      onComponentChild(category.getTemplate());
    } else {
      recordList(tenantIdOf(null), StreamTopic.LIST_COMPONENTS);
    }
  }

  /** The tenant of a loaded parent (an eager association), or the committing thread's tenant. */
  private static String tenantIdOfParent(TenantBase parent) {
    return Hibernate.isInitialized(parent) ? idOf(parent.getTenant()) : tenantIdOf(null);
  }

  /**
   * A configuration or log of a connector instance has no tenant of its own: the integrations list
   * of the instance's tenant when the instance is loaded (its tenant is eager), otherwise of the
   * committing thread's tenant.
   */
  private void onConnectorInstanceChild(ConnectorInstancePersisted instance) {
    if (instance == null) {
      return;
    }
    String tenantId =
        Hibernate.isInitialized(instance) ? idOf(instance.getTenant()) : tenantIdOf(null);
    recordList(tenantId, StreamTopic.LIST_INTEGRATIONS);
  }

  /**
   * A lessons category, or the category of a question or answer: its scenario or simulation, read
   * only when the category is already loaded.
   */
  private void onLessonsCategory(LessonsCategory category) {
    if (category != null && Hibernate.isInitialized(category)) {
      recordParents(category.getScenario(), category.getExercise());
    }
  }

  /** An answer reaches its simulation through its question and category, both already loaded. */
  private void onLessonsAnswer(LessonsAnswer answer) {
    LessonsQuestion question = answer.getQuestion();
    if (question != null && Hibernate.isInitialized(question)) {
      onLessonsCategory(question.getCategory());
    }
  }

  /** An evaluation reaches its simulation through its objective, only when it is loaded. */
  private void onEvaluation(Evaluation evaluation) {
    Objective objective = evaluation.getObjective();
    if (objective != null && Hibernate.isInitialized(objective)) {
      recordParents(objective.getScenario(), objective.getExercise());
    }
  }

  /** A comcheck status reaches its simulation through its comcheck, only when it is loaded. */
  private void onComcheckStatus(ComcheckStatus status) {
    Comcheck comcheck = status.getComcheck();
    if (comcheck != null && Hibernate.isInitialized(comcheck)) {
      recordSimulation(idOf(comcheck.getExercise()));
    }
  }

  /**
   * A communication (a mail of the simulation's mailbox) reaches its simulation through its inject,
   * whose exercise is eager, only when the inject is loaded.
   */
  private void onCommunication(Communication communication) {
    Inject inject = communication.getInject();
    if (inject != null && Hibernate.isInitialized(inject)) {
      recordSimulation(idOf(inject.getExercise()));
    }
  }

  /**
   * The scenario an initialized inject belongs to: its own, or that of its simulation. Both are
   * eager on the inject; the simulation's scenario is a lazy to-one whose id comes from the proxy.
   */
  private static String scenarioIdOf(Inject inject) {
    if (inject.getScenario() != null) {
      return idOf(inject.getScenario());
    }
    Exercise simulation = inject.getExercise();
    return simulation != null && Hibernate.isInitialized(simulation)
        ? scenarioIdOf(simulation)
        : null;
  }

  /**
   * The scenario a simulation was created from. The link is a lazy to-one through the {@code
   * scenarios_exercises} join table, read with the simulation's row, so its id comes from the proxy
   * without a query. Unlinking a simulation leaves no trace of the former scenario.
   */
  private static String scenarioIdOf(Exercise simulation) {
    return idOf(simulation.getScenario());
  }

  /**
   * Records {@code scenario:<id>} in the tenants watching it: the authorizer grants it only in the
   * scenario's own tenant, so the scenario's tenant need not be read.
   */
  private void recordScenario(String scenarioId) {
    if (scenarioId != null) {
      buffer.recordWherever(StreamTopic.scenario(scenarioId));
    }
  }

  /**
   * Records {@code simulation:<id>} in the tenants watching it, which the authorizer limits to the
   * simulation's own tenant.
   */
  private void recordSimulation(String simulationId) {
    if (simulationId != null) {
      buffer.recordWherever(StreamTopic.simulation(simulationId));
    }
  }

  /** A child owned by a scenario or by a simulation (both lazy to-ones, read from the proxy). */
  private void recordParents(Scenario scenario, Exercise simulation) {
    recordScenario(idOf(scenario));
    recordSimulation(idOf(simulation));
  }

  /**
   * Records an entity topic in the tenants watching it, which the authorizer limits to the row's
   * own tenant.
   */
  private void recordEntity(String id, Function<String, StreamTopic> topicOf) {
    if (id != null) {
      buffer.recordWherever(topicOf.apply(id));
    }
  }

  private void recordList(String tenantId, StreamTopic list) {
    if (tenantId != null) {
      buffer.record(tenantId, list);
    }
  }

  /** The topic of each row of a many-to-many, only when the collection is already loaded. */
  private void recordEach(Collection<? extends Base> rows, Function<String, StreamTopic> topicOf) {
    if (rows == null || !Hibernate.isInitialized(rows)) {
      return;
    }
    for (Base row : rows) {
      String id = idOf(row);
      if (id != null) {
        buffer.recordWherever(topicOf.apply(id));
      }
    }
  }

  /** The id of an entity or of a proxy, never initializing the proxy. */
  private static String idOf(Base entity) {
    if (entity == null) {
      return null;
    }
    LazyInitializer proxy = HibernateProxy.extractLazyInitializer(entity);
    if (proxy != null) {
      Object id = proxy.getIdentifier();
      return id == null ? null : id.toString();
    }
    return entity.getId();
  }
}
