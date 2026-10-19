package io.openaev.stream;

import io.openaev.config.cache.TenantMembershipCacheManager;
import io.openaev.database.model.Action;
import io.openaev.database.model.Inject;
import io.openaev.database.model.ResourceType;
import io.openaev.database.model.Tenant;
import io.openaev.database.model.User;
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
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Decides which topics a user may watch in a tenant.
 *
 * <p>A list topic is granted only when the user may see the whole list it stands for, so that an
 * invalidation never tells a socket about rows it could not read. {@code list:scenarios}, {@code
 * list:atomic-testings} and {@code list:simulations} therefore require the capability to search
 * every scenario, atomic testing or simulation of the tenant; a user who sees some of them only
 * through grants is denied and keeps refreshing the list the usual way. {@code list:assets}, {@code
 * list:asset-groups} and {@code list:findings} require the search capability of their search
 * endpoints (assets, asset groups, findings); these resources have no grants.
 *
 * <p>An entity topic names one row, so it is granted with the same check as the endpoint that reads
 * that row, grants included: {@code atomic-testing:<id>} requires the row to be an atomic testing
 * of the tenant and the user to pass the {@code GET /api/atomic-testings/{id}} check. A deleted row
 * is denied, which is how the heartbeat revokes the topic of an atomic testing that went away.
 * {@code scenario:<id>} likewise requires a scenario of the tenant and the {@code GET
 * /api/scenarios/{id}} check, and {@code simulation:<id>} a simulation of the tenant and the {@code
 * GET /api/exercises/{id}} check. {@code asset:<id>}, {@code asset-group:<id>} and {@code
 * finding:<id>} require a row of the tenant and the READ check of {@code GET /api/assets/{id}},
 * {@code GET /api/asset_groups/{id}} and {@code GET /api/findings/{id}}.
 *
 * <p>{@code list:integrations} stands for every integration screen (injectors and their contracts,
 * collectors, executors, connector instances and catalog, secrets providers). It requires {@code
 * ACCESS_TENANT_SETTINGS} (checked as READ on the catalog), which guards the integrations route and
 * the read endpoints of collectors, connector instances, catalog and secrets providers; injectors
 * are open to every member, and executors are read with the assets capability, whose screens the
 * topic also covers. The connector rows are tenant rows; the catalog is platform-level and is
 * invalidated in every tenant watching the topic, still subject to this per-tenant check.
 *
 * <p>Teams, persons and organizations are open resources: their search and read endpoints ({@code
 * /api/teams/search}, {@code /api/players/search}, {@code /api/organizations/search}, {@code GET
 * /api/teams/{id}}, {@code GET /api/organizations/{id}}, {@code /api/players/{id}/injects/search})
 * check SEARCH or READ on a resource {@link PermissionService} opens to every member of the tenant,
 * and return the whole tenant's rows. {@code list:teams}, {@code list:persons} and {@code
 * list:organizations} therefore go through the same check, and so does the READ of {@code
 * team:<id>}, {@code person:<id>} and {@code organization:<id>}, which also require a row of the
 * socket's tenant. A team or organization is a tenant row; a person is a platform-level user, in
 * the tenant through its {@code users_tenants} membership, which is what the players search filters
 * on.
 *
 * <p>{@code list:payloads} stands for the threat arsenal, which lists every injector contract
 * (payload-based or native). Threat arsenal entries are managed by grants, like scenarios, so the
 * topic requires the capability to search the whole arsenal ({@code ACCESS_THREAT_ARSENALS}); a
 * user who sees entries only through grants is denied. {@code payload:<id>} names one entry by the
 * id of its injector contract (the threat arsenal's {@code action_id}): it must be a contract of
 * the socket's tenant, and the user must pass the READ check of {@code GET
 * /api/threat_arsenals/{actionId}}, grants included. Contract ids repeat across tenants (built-in
 * contracts), hence the explicit tenant in the existence check.
 *
 * <p>{@code list:credentials} and {@code credential:<id>} follow the credentials endpoints: SEARCH,
 * or READ on a credential of the socket's tenant ({@code ACCESS_CREDENTIALS}, no grants).
 *
 * <p>{@code list:components} stands for every components screen and its detail pages: documents,
 * channels, challenges, phishing landing pages and email templates, and lessons templates. Each
 * type has its own capability ({@code ACCESS_DOCUMENTS}, {@code ACCESS_CHANNELS}, {@code
 * ACCESS_CHALLENGES}, {@code ACCESS_PHISHING}, {@code ACCESS_LESSONS_LEARNED}) and none implies the
 * others, so no single capability covers the topic. It is granted only to a user holding all of
 * them (an administrator or a tenant bypass included): with fewer, an invalidation would tell the
 * socket about a change in a list it cannot read. Such a user keeps refreshing the screens the
 * usual way.
 *
 * <p>{@code list:dashboards} and {@code dashboard:<id>} follow the custom dashboards endpoints
 * ({@code POST /api/custom-dashboards/search}, {@code GET /api/custom-dashboards/{id}}): SEARCH, or
 * READ on a dashboard of the socket's tenant ({@code ACCESS_DASHBOARDS}, no grants).
 *
 * <p>{@code list:reports} stands for the reportings list (and its generations and schedules). The
 * reportings search requires SEARCH on reports ({@code ACCESS_REPORTINGS}) and then hides every
 * reporting whose subject (a scenario, simulation, atomic testing, asset, asset group, player or
 * team) the user cannot read, grants included. The topic is therefore granted only to a user the
 * search filters nothing for: the reports capability and every subject type readable without grants
 * (or an administrator, or a bypass). {@code report:<id>} mirrors {@code GET /api/reportings/{id}}:
 * READ on reports, a reporting of the socket's tenant, and READ on its subject, grants included.
 *
 * <p>{@code list:analytics} tells that the search engine indexed new or changed data of the tenant,
 * so that every widget data query refetches. It names no row or entity type, only that something
 * the tenant's analytics read has changed. It is granted with the capability of the widget data
 * endpoints that can query any indexed data of the tenant: READ on dashboards ({@code POST
 * /api/dashboards/*}{@code /{widgetId}}, {@code ACCESS_DASHBOARDS}) or READ on tenant settings (the
 * home dashboard and ad-hoc widget endpoints, {@code ACCESS_TENANT_SETTINGS}). A user who sees
 * statistics only through a simulation (READ on that simulation) is denied and keeps refreshing
 * them the usual way.
 *
 * <p>Capabilities are tenant-scoped through {@code TenantContext}: callers run this inside {@link
 * StreamTenantScope#execute}, which sets both the tenant context and the tenant transaction.
 */
public class StreamTopicAuthorizer {

  /** The search resources of the screens {@code list:components} stands for. */
  private static final List<ResourceType> COMPONENT_RESOURCES =
      List.of(
          ResourceType.DOCUMENT,
          ResourceType.CHANNEL,
          ResourceType.CHALLENGE,
          ResourceType.PHISHING_LANDING_PAGE,
          ResourceType.PHISHING_EMAIL_TEMPLATE,
          ResourceType.LESSON_LEARNED);

  private final UserService userService;
  private final PermissionService permissionService;
  private final InjectService injectService;
  private final ScenarioService scenarioService;
  private final ExerciseService exerciseService;
  private final AssetService assetService;
  private final AssetGroupService assetGroupService;
  private final FindingService findingService;
  private final TeamService teamService;
  private final OrganizationService organizationService;
  private final InjectorContractService injectorContractService;
  private final CredentialService credentialService;
  private final CustomDashboardService customDashboardService;
  private final ReportingService reportingService;
  private final TenantMembershipCacheManager tenantMembershipCacheManager;

  public StreamTopicAuthorizer(
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
    this.userService = userService;
    this.permissionService = permissionService;
    this.injectService = injectService;
    this.scenarioService = scenarioService;
    this.exerciseService = exerciseService;
    this.assetService = assetService;
    this.assetGroupService = assetGroupService;
    this.findingService = findingService;
    this.teamService = teamService;
    this.organizationService = organizationService;
    this.injectorContractService = injectorContractService;
    this.credentialService = credentialService;
    this.customDashboardService = customDashboardService;
    this.reportingService = reportingService;
    this.tenantMembershipCacheManager = tenantMembershipCacheManager;
  }

  /** The subset of {@code requested} the user may watch in {@code tenantId}. */
  Set<StreamTopic> allowedTopics(
      String userId, String tenantId, Collection<StreamTopic> requested) {
    if (requested.isEmpty()) {
      return Set.of();
    }
    User user = userService.user(userId);
    return requested.stream()
        .filter(topic -> isAllowed(user, tenantId, topic))
        .collect(Collectors.toCollection(LinkedHashSet::new));
  }

  boolean isAllowed(User user, String tenantId, StreamTopic topic) {
    return switch (topic.kind()) {
      case LIST_SCENARIOS ->
          permissionService.hasCapabilityPermission(user, ResourceType.SCENARIO, Action.SEARCH);
      case LIST_ATOMIC_TESTINGS ->
          permissionService.hasCapabilityPermission(
              user, ResourceType.ATOMIC_TESTING, Action.SEARCH);
      case LIST_SIMULATIONS ->
          permissionService.hasCapabilityPermission(user, ResourceType.SIMULATION, Action.SEARCH);
      case LIST_ASSETS ->
          permissionService.hasCapabilityPermission(user, ResourceType.ASSET, Action.SEARCH);
      case LIST_ASSET_GROUPS ->
          permissionService.hasCapabilityPermission(user, ResourceType.ASSET_GROUP, Action.SEARCH);
      case LIST_FINDINGS ->
          permissionService.hasCapabilityPermission(user, ResourceType.FINDING, Action.SEARCH);
      case LIST_INTEGRATIONS ->
          permissionService.hasCapabilityPermission(user, ResourceType.CATALOG, Action.READ);
      case LIST_TEAMS -> canSearch(user, ResourceType.TEAM);
      case LIST_PERSONS -> canSearch(user, ResourceType.PLAYER);
      case LIST_ORGANIZATIONS -> canSearch(user, ResourceType.ORGANIZATION);
      case LIST_PAYLOADS ->
          permissionService.hasCapabilityPermission(
              user, ResourceType.THREAT_ARSENAL, Action.SEARCH);
      case LIST_CREDENTIALS ->
          permissionService.hasCapabilityPermission(user, ResourceType.CREDENTIAL, Action.SEARCH);
      case LIST_COMPONENTS ->
          COMPONENT_RESOURCES.stream()
              .allMatch(
                  resourceType ->
                      permissionService.hasCapabilityPermission(user, resourceType, Action.SEARCH));
      case LIST_DASHBOARDS ->
          permissionService.hasCapabilityPermission(user, ResourceType.DASHBOARD, Action.SEARCH);
      case LIST_REPORTS ->
          permissionService.hasCapabilityPermission(user, ResourceType.REPORT, Action.SEARCH)
              && reportingService.seesEveryReporting(user);
      case LIST_ANALYTICS ->
          permissionService.hasCapabilityPermission(user, ResourceType.DASHBOARD, Action.READ)
              || permissionService.hasCapabilityPermission(
                  user, ResourceType.TENANT_SETTING, Action.READ);
      case ATOMIC_TESTING -> canReadAtomicTesting(user, tenantId, topic.id());
      case SCENARIO -> canReadScenario(user, tenantId, topic.id());
      case SIMULATION -> canReadSimulation(user, tenantId, topic.id());
      case ASSET ->
          assetService.existsInTenant(topic.id(), tenantId)
              && canRead(user, topic.id(), ResourceType.ASSET);
      case ASSET_GROUP ->
          assetGroupService.existsInTenant(topic.id(), tenantId)
              && canRead(user, topic.id(), ResourceType.ASSET_GROUP);
      case FINDING ->
          findingService.existsInTenant(topic.id(), tenantId)
              && canRead(user, topic.id(), ResourceType.FINDING);
      case TEAM ->
          teamService.existsInTenant(topic.id(), tenantId)
              && canRead(user, topic.id(), ResourceType.TEAM);
      case PERSON -> canReadPerson(user, tenantId, topic.id());
      case ORGANIZATION ->
          organizationService.existsInTenant(topic.id(), tenantId)
              && canRead(user, topic.id(), ResourceType.ORGANIZATION);
      case PAYLOAD -> canReadPayload(user, tenantId, topic.id());
      case CREDENTIAL ->
          credentialService.existsInTenant(topic.id(), tenantId)
              && canRead(user, topic.id(), ResourceType.CREDENTIAL);
      case DASHBOARD ->
          customDashboardService.existsInTenant(topic.id(), tenantId)
              && canRead(user, topic.id(), ResourceType.DASHBOARD);
      case REPORT -> canReadReport(user, tenantId, topic.id());
    };
  }

  /**
   * Mirrors {@code GET /api/atomic-testings/{injectId}}, which checks READ on the inject resource
   * (resolved to its atomic-testing parent, capability or grant). The lookup by primary key is not
   * covered by the tenant filter, hence the explicit tenant comparison; it runs first so that the
   * permission check, which loads the inject again and throws on a missing one, never sees an
   * unknown id.
   */
  private boolean canReadAtomicTesting(User user, String tenantId, String injectId) {
    Inject inject = injectService.findInjectOrNull(injectId);
    if (inject == null || !inject.isAtomicTesting()) {
      return false;
    }
    String injectTenantId = Optional.ofNullable(inject.getTenant()).map(Tenant::getId).orElse(null);
    if (tenantId == null || !tenantId.equals(injectTenantId)) {
      return false;
    }
    return permissionService.hasPermission(
        user, Optional.empty(), injectId, ResourceType.INJECT, Action.READ);
  }

  /**
   * Mirrors {@code GET /api/scenarios/{scenarioId}}, which checks READ on the scenario resource
   * (capability or grant). The existence check names the tenant explicitly rather than relying on
   * the tenant filter, so a scenario of another tenant is denied like a missing one.
   */
  private boolean canReadScenario(User user, String tenantId, String scenarioId) {
    if (!scenarioService.existsInTenant(scenarioId, tenantId)) {
      return false;
    }
    return permissionService.hasPermission(
        user, Optional.empty(), scenarioId, ResourceType.SCENARIO, Action.READ);
  }

  /**
   * Mirrors {@code GET /api/exercises/{exerciseId}}, which checks READ on the simulation resource
   * (capability or grant). As for a scenario, the existence check names the tenant explicitly.
   */
  private boolean canReadSimulation(User user, String tenantId, String exerciseId) {
    if (!exerciseService.existsInTenant(exerciseId, tenantId)) {
      return false;
    }
    return permissionService.hasPermission(
        user, Optional.empty(), exerciseId, ResourceType.SIMULATION, Action.READ);
  }

  /**
   * Mirrors {@code GET /api/threat_arsenals/{actionId}}, which checks READ on the threat arsenal
   * resource (capability or grant) on the injector contract id. The existence check names the
   * tenant explicitly, so a contract of another tenant (built-in ids repeat) is denied like a
   * missing one.
   */
  private boolean canReadPayload(User user, String tenantId, String id) {
    if (!injectorContractService.existsInTenant(id, tenantId)) {
      return false;
    }
    return permissionService.hasPermission(
        user, Optional.empty(), id, ResourceType.THREAT_ARSENAL, Action.READ);
  }

  /**
   * Mirrors {@code GET /api/reportings/{reportingId}}: READ on reports (capability only), then a
   * reporting of the socket's tenant whose subject the user can read, grants included. The
   * capability is checked first, so a user without it causes no query.
   */
  private boolean canReadReport(User user, String tenantId, String reportingId) {
    return canRead(user, reportingId, ResourceType.REPORT)
        && reportingService.isReadableInTenant(reportingId, tenantId, user);
  }

  /**
   * The READ check of the endpoint that reads one asset, asset group, finding, team, person,
   * organization, credential, custom dashboard or reporting: these resources have no grants, so it
   * comes down to the capability (always met for the open teams, players and organizations). The
   * existence check in the caller names the tenant explicitly, so a row of another tenant is denied
   * like a missing one.
   */
  private boolean canRead(User user, String id, ResourceType resourceType) {
    return permissionService.hasPermission(user, Optional.empty(), id, resourceType, Action.READ);
  }

  /**
   * Mirrors the person screen's endpoints ({@code /api/players/{id}/injects/search}), which check
   * READ on the player resource. A user is not a tenant row: it belongs to the socket's tenant
   * through {@code users_tenants}, the membership the players search filters on. The check goes
   * through the membership cache, which is evicted whenever a user joins or leaves a tenant.
   */
  private boolean canReadPerson(User user, String tenantId, String userId) {
    if (tenantId == null
        || !tenantMembershipCacheManager.existsByUserIdAndTenantId(userId, tenantId)) {
      return false;
    }
    return canRead(user, userId, ResourceType.PLAYER);
  }

  /**
   * The SEARCH check of a search endpoint whose resource may be open to every member (teams,
   * players, organizations), as {@code @AccessControl} applies it: open, or the capability.
   */
  private boolean canSearch(User user, ResourceType resourceType) {
    return PermissionService.isOpenResource(resourceType, Action.SEARCH)
        || permissionService.hasCapabilityPermission(user, resourceType, Action.SEARCH);
  }
}
