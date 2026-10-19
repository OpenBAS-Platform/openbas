package io.openaev.stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.openaev.config.TenantWriteScopeResolver;
import io.openaev.config.cache.TenantMembershipCacheManager;
import io.openaev.context.TenantContext;
import io.openaev.database.model.Capability;
import io.openaev.database.model.Exercise;
import io.openaev.database.model.Grant;
import io.openaev.database.model.Group;
import io.openaev.database.model.Inject;
import io.openaev.database.model.Reporting;
import io.openaev.database.model.ReportingContextType;
import io.openaev.database.model.Role;
import io.openaev.database.model.Scenario;
import io.openaev.database.model.Team;
import io.openaev.database.model.Tenant;
import io.openaev.database.model.User;
import io.openaev.database.repository.EvaluationRepository;
import io.openaev.database.repository.ObjectiveRepository;
import io.openaev.database.repository.ReportingGenerationRepository;
import io.openaev.database.repository.ReportingRepository;
import io.openaev.database.repository.ReportingScheduleRepository;
import io.openaev.database.repository.UserRepository;
import io.openaev.rest.custom_dashboard.CustomDashboardService;
import io.openaev.rest.document.DocumentService;
import io.openaev.rest.exercise.service.ExerciseService;
import io.openaev.rest.finding.FindingService;
import io.openaev.rest.inject.service.InjectService;
import io.openaev.rest.injector_contract.InjectorContractService;
import io.openaev.rest.reporting.ReportingService;
import io.openaev.rest.reporting.service.ReportingRenderer;
import io.openaev.service.AssetGroupService;
import io.openaev.service.AssetService;
import io.openaev.service.GrantService;
import io.openaev.service.PermissionService;
import io.openaev.service.TeamService;
import io.openaev.service.UserService;
import io.openaev.service.autonomous.AutonomousRunService;
import io.openaev.service.chaining.ConditionService;
import io.openaev.service.chaining.StepService;
import io.openaev.service.chaining.WorkflowService;
import io.openaev.service.credential.CredentialService;
import io.openaev.service.organization.OrganizationService;
import io.openaev.service.scenario.ScenarioService;
import io.openaev.utils.fixtures.GrantFixture;
import io.openaev.utils.fixtures.TenantGroupFixture;
import io.openaev.utils.fixtures.TenantRoleFixture;
import io.openaev.utils.fixtures.UserFixture;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.BiConsumer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

@DisplayName("StreamTopicAuthorizer: which topics a user may watch")
class StreamTopicAuthorizerTest {

  private static final String TENANT_ID = UUID.randomUUID().toString();
  private static final String OTHER_TENANT_ID = UUID.randomUUID().toString();
  private static final String USER_ID = "user-id";

  private static final String INJECT_ID = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";

  private final UserService userService = mock(UserService.class);
  private final InjectService injectService = mock(InjectService.class);
  private final GrantService grantService = mock(GrantService.class);
  private final ScenarioService scenarioService = mock(ScenarioService.class);
  private final ExerciseService exerciseService = mock(ExerciseService.class);
  private final AssetService assetService = mock(AssetService.class);
  private final AssetGroupService assetGroupService = mock(AssetGroupService.class);
  private final FindingService findingService = mock(FindingService.class);
  private final TeamService teamService = mock(TeamService.class);
  private final OrganizationService organizationService = mock(OrganizationService.class);
  private final InjectorContractService injectorContractService =
      mock(InjectorContractService.class);
  private final CredentialService credentialService = mock(CredentialService.class);
  private final TenantMembershipCacheManager tenantMembershipCacheManager =
      mock(TenantMembershipCacheManager.class);
  private final CustomDashboardService customDashboardService = mock(CustomDashboardService.class);
  private final ReportingRepository reportingRepository = mock(ReportingRepository.class);
  private StreamTopicAuthorizer authorizer;

  @BeforeEach
  void setUp() {
    // The real permission logic; only its collaborators for resource lookups are mocked.
    PermissionService permissionService =
        new PermissionService(
            grantService,
            injectService,
            mock(AutonomousRunService.class),
            mock(ObjectiveRepository.class),
            mock(EvaluationRepository.class),
            mock(WorkflowService.class),
            mock(StepService.class),
            mock(ConditionService.class));
    authorizer =
        new StreamTopicAuthorizer(
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
            reportingService(permissionService),
            tenantMembershipCacheManager);
    TenantContext.setCurrentTenant(TENANT_ID);
  }

  /** The real reporting access logic, over a mocked reporting lookup. */
  private ReportingService reportingService(PermissionService permissionService) {
    return new ReportingService(
        reportingRepository,
        mock(ReportingGenerationRepository.class),
        mock(ReportingScheduleRepository.class),
        mock(UserRepository.class),
        userService,
        mock(DocumentService.class),
        mock(ReportingRenderer.class),
        permissionService,
        grantService,
        mock(TenantWriteScopeResolver.class));
  }

  @AfterEach
  void tearDown() {
    TenantContext.clearCurrentTenant();
  }

  private static Group tenantGroup(String tenantId, Set<Capability> capabilities) {
    Group group = TenantGroupFixture.getGroup("group-" + UUID.randomUUID());
    group.setTenant(new Tenant(tenantId));
    Role role = TenantRoleFixture.getRole("role-" + UUID.randomUUID(), capabilities);
    group.setRoles(new ArrayList<>(List.of(role)));
    return group;
  }

  private Set<StreamTopic> allowedFor(User user) {
    when(userService.user(USER_ID)).thenReturn(user);
    return authorizer.allowedTopics(USER_ID, TENANT_ID, Set.of(StreamTopic.LIST_SCENARIOS));
  }

  @Test
  @DisplayName("an administrator is granted list:scenarios")
  void given_admin_should_beGranted() {
    User admin = UserFixture.getAdminUser("Alice", "Admin", "alice@unittests.invalid");

    assertThat(allowedFor(admin)).containsExactly(StreamTopic.LIST_SCENARIOS);
  }

  @Test
  @DisplayName("a user holding ACCESS_ASSESSMENT in the tenant is granted list:scenarios")
  void given_accessAssessment_should_beGranted() {
    User bob = UserFixture.getUser("Bob", "Viewer", "bob@unittests.invalid");
    bob.setGroups(
        new ArrayList<>(List.of(tenantGroup(TENANT_ID, Set.of(Capability.ACCESS_ASSESSMENT)))));

    assertThat(allowedFor(bob)).containsExactly(StreamTopic.LIST_SCENARIOS);
  }

  @Test
  @DisplayName("ACCESS_ASSESSMENT held in another tenant does not count")
  void given_accessAssessmentInOtherTenant_should_beDenied() {
    User bob = UserFixture.getUser("Bob", "Viewer", "bob@unittests.invalid");
    bob.setGroups(
        new ArrayList<>(
            List.of(tenantGroup(OTHER_TENANT_ID, Set.of(Capability.ACCESS_ASSESSMENT)))));

    assertThat(allowedFor(bob)).isEmpty();
  }

  @Test
  @DisplayName("a user who sees scenarios only through grants is denied")
  void given_grantsOnly_should_beDenied() {
    User carol = UserFixture.getUser("Carol", "Granted", "carol@unittests.invalid");
    Group group = tenantGroup(TENANT_ID, Set.of(Capability.ACCESS_ASSETS));
    Grant grant =
        GrantFixture.getGrant(
            UUID.randomUUID().toString(),
            Grant.GRANT_RESOURCE_TYPE.SCENARIO,
            Grant.GRANT_TYPE.PLANNER,
            group);
    group.setGrants(new ArrayList<>(List.of(grant)));
    carol.setGroups(new ArrayList<>(List.of(group)));

    assertThat(carol.getGrants()).isNotEmpty();
    assertThat(allowedFor(carol)).isEmpty();
  }

  @Test
  @DisplayName("a player is denied")
  void given_player_should_beDenied() {
    User player = UserFixture.getUser("Pat", "Player", "pat@unittests.invalid");
    player.setTeams(new ArrayList<>(List.of(new Team())));

    assertThat(player.isPlayer()).isTrue();
    assertThat(allowedFor(player)).isEmpty();
  }

  @Test
  @DisplayName("nothing requested loads nothing")
  void given_noTopic_should_returnEmpty() {
    assertThat(authorizer.allowedTopics(USER_ID, TENANT_ID, Set.of())).isEmpty();
  }

  private static User viewer(Set<Capability> capabilities) {
    User user = UserFixture.getUser("Bob", "Viewer", "bob@unittests.invalid");
    user.setGroups(new ArrayList<>(List.of(tenantGroup(TENANT_ID, capabilities))));
    return user;
  }

  private static Inject inject(String tenantId) {
    Inject inject = new Inject();
    inject.setId(INJECT_ID);
    inject.setTenant(new Tenant(tenantId));
    return inject;
  }

  @Nested
  @DisplayName("list:atomic-testings needs the capability to see every atomic testing")
  class ListAtomicTestings {

    private Set<StreamTopic> allowedFor(User user) {
      when(userService.user(USER_ID)).thenReturn(user);
      return authorizer.allowedTopics(USER_ID, TENANT_ID, Set.of(StreamTopic.LIST_ATOMIC_TESTINGS));
    }

    @Test
    @DisplayName("a user holding ACCESS_ASSESSMENT in the tenant is granted")
    void given_accessAssessment_should_beGranted() {
      assertThat(allowedFor(viewer(Set.of(Capability.ACCESS_ASSESSMENT))))
          .containsExactly(StreamTopic.LIST_ATOMIC_TESTINGS);
    }

    @Test
    @DisplayName("a user without the capability is denied, grants or not")
    void given_noCapability_should_beDenied() {
      User carol = UserFixture.getUser("Carol", "Granted", "carol@unittests.invalid");
      Group group = tenantGroup(TENANT_ID, Set.of(Capability.ACCESS_ASSETS));
      Grant grant =
          GrantFixture.getGrant(
              INJECT_ID,
              Grant.GRANT_RESOURCE_TYPE.ATOMIC_TESTING,
              Grant.GRANT_TYPE.OBSERVER,
              group);
      group.setGrants(new ArrayList<>(List.of(grant)));
      carol.setGroups(new ArrayList<>(List.of(group)));

      assertThat(allowedFor(carol)).isEmpty();
    }
  }

  @Nested
  @DisplayName("atomic-testing:<id> needs READ on that atomic testing of the tenant")
  class AtomicTesting {

    private final StreamTopic topic = StreamTopic.atomicTesting(INJECT_ID);

    private Set<StreamTopic> allowedFor(User user) {
      when(userService.user(USER_ID)).thenReturn(user);
      return authorizer.allowedTopics(USER_ID, TENANT_ID, Set.of(topic));
    }

    private void injectIs(Inject inject) {
      when(injectService.findInjectOrNull(INJECT_ID)).thenReturn(inject);
      when(injectService.inject(INJECT_ID)).thenReturn(inject);
    }

    @Test
    @DisplayName("a user holding ACCESS_ASSESSMENT is granted")
    void given_accessAssessment_should_beGranted() {
      injectIs(inject(TENANT_ID));

      assertThat(allowedFor(viewer(Set.of(Capability.ACCESS_ASSESSMENT)))).containsExactly(topic);
    }

    @Test
    @DisplayName("a user with a read grant on the atomic testing is granted")
    void given_readGrant_should_beGranted() {
      injectIs(inject(TENANT_ID));
      User carol = viewer(Set.of(Capability.ACCESS_ASSETS));
      when(grantService.hasReadGrant(INJECT_ID, carol)).thenReturn(true);

      assertThat(allowedFor(carol)).containsExactly(topic);
    }

    @Test
    @DisplayName("a user with neither capability nor grant is denied")
    void given_noRight_should_beDenied() {
      injectIs(inject(TENANT_ID));

      assertThat(allowedFor(viewer(Set.of(Capability.ACCESS_ASSETS)))).isEmpty();
    }

    @Test
    @DisplayName("a missing (or deleted) atomic testing is denied, even to an administrator")
    void given_missingInject_should_beDenied() {
      injectIs(null);

      assertThat(allowedFor(UserFixture.getAdminUser("Alice", "Admin", "alice@unittests.invalid")))
          .isEmpty();
    }

    @Test
    @DisplayName("an atomic testing of another tenant is denied, even to an administrator")
    void given_otherTenantInject_should_beDenied() {
      injectIs(inject(OTHER_TENANT_ID));

      assertThat(allowedFor(UserFixture.getAdminUser("Alice", "Admin", "alice@unittests.invalid")))
          .isEmpty();
    }

    @Test
    @DisplayName("an inject of a simulation or a scenario is denied")
    void given_notAtomicTesting_should_beDenied() {
      Inject simulationInject = inject(TENANT_ID);
      simulationInject.setExercise(new Exercise());
      injectIs(simulationInject);
      User admin = UserFixture.getAdminUser("Alice", "Admin", "alice@unittests.invalid");

      assertThat(allowedFor(admin)).isEmpty();

      Inject scenarioInject = inject(TENANT_ID);
      scenarioInject.setScenario(new Scenario());
      injectIs(scenarioInject);

      assertThat(allowedFor(admin)).isEmpty();
    }
  }

  @Nested
  @DisplayName("scenario:<id> needs READ on that scenario of the tenant")
  class ScenarioDetail {

    private static final String SCENARIO_ID = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    private final StreamTopic topic = StreamTopic.scenario(SCENARIO_ID);

    private Set<StreamTopic> allowedFor(User user) {
      when(userService.user(USER_ID)).thenReturn(user);
      return authorizer.allowedTopics(USER_ID, TENANT_ID, Set.of(topic));
    }

    private void scenarioExistsIn(String tenantId) {
      when(scenarioService.existsInTenant(SCENARIO_ID, tenantId)).thenReturn(true);
    }

    private static User grantedOn(String scenarioId, Grant.GRANT_TYPE type) {
      User carol = UserFixture.getUser("Carol", "Granted", "carol@unittests.invalid");
      Group group = tenantGroup(TENANT_ID, Set.of(Capability.ACCESS_ASSETS));
      group.setGrants(
          new ArrayList<>(
              List.of(
                  GrantFixture.getGrant(
                      scenarioId, Grant.GRANT_RESOURCE_TYPE.SCENARIO, type, group))));
      carol.setGroups(new ArrayList<>(List.of(group)));
      return carol;
    }

    @Test
    @DisplayName("a user holding ACCESS_ASSESSMENT is granted")
    void given_accessAssessment_should_beGranted() {
      scenarioExistsIn(TENANT_ID);

      assertThat(allowedFor(viewer(Set.of(Capability.ACCESS_ASSESSMENT)))).containsExactly(topic);
    }

    @Test
    @DisplayName("a user with a read grant on the scenario is granted")
    void given_readGrant_should_beGranted() {
      // Arrange
      scenarioExistsIn(TENANT_ID);
      User carol = grantedOn(SCENARIO_ID, Grant.GRANT_TYPE.OBSERVER);
      when(grantService.hasReadGrant(SCENARIO_ID, carol)).thenReturn(true);

      // Act & Assert
      assertThat(allowedFor(carol)).containsExactly(topic);
    }

    @Test
    @DisplayName("a user with neither capability nor grant is denied")
    void given_noRight_should_beDenied() {
      scenarioExistsIn(TENANT_ID);

      assertThat(allowedFor(viewer(Set.of(Capability.ACCESS_ASSETS)))).isEmpty();
    }

    @Test
    @DisplayName("a player is denied")
    void given_player_should_beDenied() {
      scenarioExistsIn(TENANT_ID);
      User player = UserFixture.getUser("Pat", "Player", "pat@unittests.invalid");
      player.setTeams(new ArrayList<>(List.of(new Team())));

      assertThat(allowedFor(player)).isEmpty();
    }

    @Test
    @DisplayName("a missing (or deleted) scenario is denied, even to an administrator")
    void given_missingScenario_should_beDenied() {
      assertThat(allowedFor(UserFixture.getAdminUser("Alice", "Admin", "alice@unittests.invalid")))
          .isEmpty();
      verify(grantService, never()).hasReadGrant(anyString(), any());
    }

    @Test
    @DisplayName("a scenario of another tenant is denied, even to an administrator")
    void given_otherTenantScenario_should_beDenied() {
      scenarioExistsIn(OTHER_TENANT_ID);

      assertThat(allowedFor(UserFixture.getAdminUser("Alice", "Admin", "alice@unittests.invalid")))
          .isEmpty();
    }
  }

  @Nested
  @DisplayName("list:simulations needs the capability to see every simulation")
  class ListSimulations {

    private Set<StreamTopic> allowedFor(User user) {
      when(userService.user(USER_ID)).thenReturn(user);
      return authorizer.allowedTopics(USER_ID, TENANT_ID, Set.of(StreamTopic.LIST_SIMULATIONS));
    }

    @Test
    @DisplayName("an administrator is granted")
    void given_admin_should_beGranted() {
      assertThat(allowedFor(UserFixture.getAdminUser("Alice", "Admin", "alice@unittests.invalid")))
          .containsExactly(StreamTopic.LIST_SIMULATIONS);
    }

    @Test
    @DisplayName("a user holding ACCESS_ASSESSMENT in the tenant is granted")
    void given_accessAssessment_should_beGranted() {
      assertThat(allowedFor(viewer(Set.of(Capability.ACCESS_ASSESSMENT))))
          .containsExactly(StreamTopic.LIST_SIMULATIONS);
    }

    @Test
    @DisplayName("ACCESS_ASSESSMENT held in another tenant does not count")
    void given_accessAssessmentInOtherTenant_should_beDenied() {
      User bob = UserFixture.getUser("Bob", "Viewer", "bob@unittests.invalid");
      bob.setGroups(
          new ArrayList<>(
              List.of(tenantGroup(OTHER_TENANT_ID, Set.of(Capability.ACCESS_ASSESSMENT)))));

      assertThat(allowedFor(bob)).isEmpty();
    }

    @Test
    @DisplayName("a user who sees simulations only through grants is denied")
    void given_grantsOnly_should_beDenied() {
      User carol = UserFixture.getUser("Carol", "Granted", "carol@unittests.invalid");
      Group group = tenantGroup(TENANT_ID, Set.of(Capability.ACCESS_ASSETS));
      group.setGrants(
          new ArrayList<>(
              List.of(
                  GrantFixture.getGrant(
                      UUID.randomUUID().toString(),
                      Grant.GRANT_RESOURCE_TYPE.SIMULATION,
                      Grant.GRANT_TYPE.OBSERVER,
                      group))));
      carol.setGroups(new ArrayList<>(List.of(group)));

      assertThat(carol.getGrants()).isNotEmpty();
      assertThat(allowedFor(carol)).isEmpty();
    }

    @Test
    @DisplayName("a player is denied")
    void given_player_should_beDenied() {
      User player = UserFixture.getUser("Pat", "Player", "pat@unittests.invalid");
      player.setTeams(new ArrayList<>(List.of(new Team())));

      assertThat(allowedFor(player)).isEmpty();
    }
  }

  @Nested
  @DisplayName("simulation:<id> needs READ on that simulation of the tenant")
  class SimulationDetail {

    private static final String SIMULATION_ID = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
    private final StreamTopic topic = StreamTopic.simulation(SIMULATION_ID);

    private Set<StreamTopic> allowedFor(User user) {
      when(userService.user(USER_ID)).thenReturn(user);
      return authorizer.allowedTopics(USER_ID, TENANT_ID, Set.of(topic));
    }

    private void simulationExistsIn(String tenantId) {
      when(exerciseService.existsInTenant(SIMULATION_ID, tenantId)).thenReturn(true);
    }

    private static User grantedOn(String simulationId) {
      User carol = UserFixture.getUser("Carol", "Granted", "carol@unittests.invalid");
      Group group = tenantGroup(TENANT_ID, Set.of(Capability.ACCESS_ASSETS));
      group.setGrants(
          new ArrayList<>(
              List.of(
                  GrantFixture.getGrant(
                      simulationId,
                      Grant.GRANT_RESOURCE_TYPE.SIMULATION,
                      Grant.GRANT_TYPE.OBSERVER,
                      group))));
      carol.setGroups(new ArrayList<>(List.of(group)));
      return carol;
    }

    @Test
    @DisplayName("a user holding ACCESS_ASSESSMENT is granted")
    void given_accessAssessment_should_beGranted() {
      simulationExistsIn(TENANT_ID);

      assertThat(allowedFor(viewer(Set.of(Capability.ACCESS_ASSESSMENT)))).containsExactly(topic);
    }

    @Test
    @DisplayName("a user with a read grant on the simulation is granted")
    void given_readGrant_should_beGranted() {
      // Arrange
      simulationExistsIn(TENANT_ID);
      User carol = grantedOn(SIMULATION_ID);
      when(grantService.hasReadGrant(SIMULATION_ID, carol)).thenReturn(true);

      // Act & Assert
      assertThat(allowedFor(carol)).containsExactly(topic);
    }

    @Test
    @DisplayName("a user with neither capability nor grant is denied")
    void given_noRight_should_beDenied() {
      simulationExistsIn(TENANT_ID);

      assertThat(allowedFor(viewer(Set.of(Capability.ACCESS_ASSETS)))).isEmpty();
    }

    @Test
    @DisplayName("a player is denied")
    void given_player_should_beDenied() {
      simulationExistsIn(TENANT_ID);
      User player = UserFixture.getUser("Pat", "Player", "pat@unittests.invalid");
      player.setTeams(new ArrayList<>(List.of(new Team())));

      assertThat(allowedFor(player)).isEmpty();
    }

    @Test
    @DisplayName("a missing (or deleted) simulation is denied, even to an administrator")
    void given_missingSimulation_should_beDenied() {
      assertThat(allowedFor(UserFixture.getAdminUser("Alice", "Admin", "alice@unittests.invalid")))
          .isEmpty();
      verify(grantService, never()).hasReadGrant(anyString(), any());
    }

    @Test
    @DisplayName("a simulation of another tenant is denied, even to an administrator")
    void given_otherTenantSimulation_should_beDenied() {
      simulationExistsIn(OTHER_TENANT_ID);

      assertThat(allowedFor(UserFixture.getAdminUser("Alice", "Admin", "alice@unittests.invalid")))
          .isEmpty();
    }

    @Test
    @DisplayName("a scenario's id is not a simulation")
    void given_scenarioId_should_beDenied() {
      when(scenarioService.existsInTenant(SIMULATION_ID, TENANT_ID)).thenReturn(true);

      assertThat(allowedFor(UserFixture.getAdminUser("Alice", "Admin", "alice@unittests.invalid")))
          .isEmpty();
    }
  }

  private Set<StreamTopic> allowed(User user, StreamTopic topic) {
    when(userService.user(USER_ID)).thenReturn(user);
    return authorizer.allowedTopics(USER_ID, TENANT_ID, Set.of(topic));
  }

  private static User admin() {
    return UserFixture.getAdminUser("Alice", "Admin", "alice@unittests.invalid");
  }

  @Nested
  @DisplayName("list:assets, list:asset-groups and list:findings need the search capability")
  class AssetAndFindingLists {

    @Test
    @DisplayName("ACCESS_ASSETS in the tenant grants the asset and asset-group lists only")
    void given_accessAssets_should_grantAssetLists() {
      User bob = viewer(Set.of(Capability.ACCESS_ASSETS));

      assertThat(allowed(bob, StreamTopic.LIST_ASSETS)).containsExactly(StreamTopic.LIST_ASSETS);
      assertThat(allowed(bob, StreamTopic.LIST_ASSET_GROUPS))
          .containsExactly(StreamTopic.LIST_ASSET_GROUPS);
      assertThat(allowed(bob, StreamTopic.LIST_FINDINGS)).isEmpty();
    }

    @Test
    @DisplayName("ACCESS_FINDINGS in the tenant grants the findings list only")
    void given_accessFindings_should_grantFindingsList() {
      User bob = viewer(Set.of(Capability.ACCESS_FINDINGS));

      assertThat(allowed(bob, StreamTopic.LIST_FINDINGS))
          .containsExactly(StreamTopic.LIST_FINDINGS);
      assertThat(allowed(bob, StreamTopic.LIST_ASSETS)).isEmpty();
      assertThat(allowed(bob, StreamTopic.LIST_ASSET_GROUPS)).isEmpty();
    }

    @Test
    @DisplayName("the capabilities held in another tenant do not count")
    void given_capabilitiesInOtherTenant_should_beDenied() {
      User bob = UserFixture.getUser("Bob", "Viewer", "bob@unittests.invalid");
      bob.setGroups(
          new ArrayList<>(
              List.of(
                  tenantGroup(
                      OTHER_TENANT_ID,
                      Set.of(Capability.ACCESS_ASSETS, Capability.ACCESS_FINDINGS)))));

      assertThat(allowed(bob, StreamTopic.LIST_ASSETS)).isEmpty();
      assertThat(allowed(bob, StreamTopic.LIST_ASSET_GROUPS)).isEmpty();
      assertThat(allowed(bob, StreamTopic.LIST_FINDINGS)).isEmpty();
    }

    @Test
    @DisplayName("an administrator is granted all three")
    void given_admin_should_beGranted() {
      when(userService.user(USER_ID)).thenReturn(admin());

      assertThat(
              authorizer.allowedTopics(
                  USER_ID,
                  TENANT_ID,
                  Set.of(
                      StreamTopic.LIST_ASSETS,
                      StreamTopic.LIST_ASSET_GROUPS,
                      StreamTopic.LIST_FINDINGS)))
          .containsExactlyInAnyOrder(
              StreamTopic.LIST_ASSETS, StreamTopic.LIST_ASSET_GROUPS, StreamTopic.LIST_FINDINGS);
    }
  }

  /**
   * The checks shared by asset:, asset-group: and finding:<id>: a row of the socket's tenant and
   * the READ capability of the endpoint that reads it (these resources have no grants).
   */
  abstract class EntityDetail {

    static final String ID = "6ba7b812-9dad-11d1-80b4-00c04fd430c8";

    abstract StreamTopic topic();

    abstract Capability readCapability();

    /** Stubs the owning service's existence check for (id, tenant). */
    abstract BiConsumer<String, String> existsIn();

    private Set<StreamTopic> allowedFor(User user) {
      return allowed(user, topic());
    }

    @Test
    @DisplayName("a user holding the read capability in the tenant is granted")
    void given_readCapability_should_beGranted() {
      existsIn().accept(ID, TENANT_ID);

      assertThat(allowedFor(viewer(Set.of(readCapability())))).containsExactly(topic());
    }

    @Test
    @DisplayName("a user without the read capability is denied, a scenario grant included")
    void given_noCapability_should_beDenied() {
      existsIn().accept(ID, TENANT_ID);
      User carol = viewer(Set.of(Capability.ACCESS_ASSESSMENT));
      when(grantService.hasReadGrant(anyString(), any())).thenReturn(true);

      assertThat(allowedFor(carol)).isEmpty();
    }

    @Test
    @DisplayName("a player is denied")
    void given_player_should_beDenied() {
      existsIn().accept(ID, TENANT_ID);
      User player = UserFixture.getUser("Pat", "Player", "pat@unittests.invalid");
      player.setTeams(new ArrayList<>(List.of(new Team())));

      assertThat(allowedFor(player)).isEmpty();
    }

    @Test
    @DisplayName("a missing (or deleted) row is denied, even to an administrator")
    void given_missingRow_should_beDenied() {
      assertThat(allowedFor(admin())).isEmpty();
    }

    @Test
    @DisplayName("a row of another tenant is denied, even to an administrator")
    void given_otherTenantRow_should_beDenied() {
      existsIn().accept(ID, OTHER_TENANT_ID);

      assertThat(allowedFor(admin())).isEmpty();
    }
  }

  @Nested
  @DisplayName("asset:<id> needs READ on assets and an asset of the tenant")
  class AssetDetail extends EntityDetail {

    @Override
    StreamTopic topic() {
      return StreamTopic.asset(ID);
    }

    @Override
    Capability readCapability() {
      return Capability.ACCESS_ASSETS;
    }

    @Override
    BiConsumer<String, String> existsIn() {
      return (id, tenantId) -> when(assetService.existsInTenant(id, tenantId)).thenReturn(true);
    }

    @Test
    @DisplayName("an asset group's id is not an asset")
    void given_assetGroupId_should_beDenied() {
      when(assetGroupService.existsInTenant(ID, TENANT_ID)).thenReturn(true);

      assertThat(allowed(admin(), topic())).isEmpty();
    }
  }

  @Nested
  @DisplayName("asset-group:<id> needs READ on asset groups and a group of the tenant")
  class AssetGroupDetail extends EntityDetail {

    @Override
    StreamTopic topic() {
      return StreamTopic.assetGroup(ID);
    }

    @Override
    Capability readCapability() {
      return Capability.ACCESS_ASSETS;
    }

    @Override
    BiConsumer<String, String> existsIn() {
      return (id, tenantId) ->
          when(assetGroupService.existsInTenant(id, tenantId)).thenReturn(true);
    }
  }

  @Nested
  @DisplayName("finding:<id> needs READ on findings and a finding of the tenant")
  class FindingDetail extends EntityDetail {

    @Override
    StreamTopic topic() {
      return StreamTopic.finding(ID);
    }

    @Override
    Capability readCapability() {
      return Capability.ACCESS_FINDINGS;
    }

    @Override
    BiConsumer<String, String> existsIn() {
      return (id, tenantId) -> when(findingService.existsInTenant(id, tenantId)).thenReturn(true);
    }

    @Test
    @DisplayName("ACCESS_ASSETS does not read a finding")
    void given_accessAssets_should_beDenied() {
      when(findingService.existsInTenant(ID, TENANT_ID)).thenReturn(true);

      assertThat(allowed(viewer(Set.of(Capability.ACCESS_ASSETS)), topic())).isEmpty();
    }
  }

  @Nested
  @DisplayName("list:integrations needs the tenant settings access of the integrations screens")
  class ListIntegrations {

    @Test
    @DisplayName("ACCESS_TENANT_SETTINGS in the tenant grants list:integrations")
    void given_accessTenantSettings_should_beGranted() {
      User bob = viewer(Set.of(Capability.ACCESS_TENANT_SETTINGS));

      assertThat(allowed(bob, StreamTopic.LIST_INTEGRATIONS))
          .containsExactly(StreamTopic.LIST_INTEGRATIONS);
    }

    @Test
    @DisplayName("ACCESS_ASSETS alone (executors) does not grant list:integrations")
    void given_accessAssetsOnly_should_beDenied() {
      User bob = viewer(Set.of(Capability.ACCESS_ASSETS));

      assertThat(allowed(bob, StreamTopic.LIST_INTEGRATIONS)).isEmpty();
    }

    @Test
    @DisplayName("ACCESS_TENANT_SETTINGS held in another tenant does not count")
    void given_accessTenantSettingsInOtherTenant_should_beDenied() {
      User bob = UserFixture.getUser("Bob", "Viewer", "bob@unittests.invalid");
      bob.setGroups(
          new ArrayList<>(
              List.of(tenantGroup(OTHER_TENANT_ID, Set.of(Capability.ACCESS_TENANT_SETTINGS)))));

      assertThat(allowed(bob, StreamTopic.LIST_INTEGRATIONS)).isEmpty();
    }

    @Test
    @DisplayName("an administrator is granted list:integrations")
    void given_admin_should_beGranted() {
      assertThat(allowed(admin(), StreamTopic.LIST_INTEGRATIONS))
          .containsExactly(StreamTopic.LIST_INTEGRATIONS);
    }
  }

  @Nested
  @DisplayName("list:teams, list:persons and list:organizations follow their open search endpoints")
  class TeamPersonAndOrganizationLists {

    private final Set<StreamTopic> lists =
        Set.of(StreamTopic.LIST_TEAMS, StreamTopic.LIST_PERSONS, StreamTopic.LIST_ORGANIZATIONS);

    @Test
    @DisplayName("a member without any of their capabilities is granted all three")
    void given_memberWithoutCapability_should_beGranted() {
      when(userService.user(USER_ID)).thenReturn(viewer(Set.of(Capability.ACCESS_ASSESSMENT)));

      assertThat(authorizer.allowedTopics(USER_ID, TENANT_ID, lists))
          .containsExactlyInAnyOrderElementsOf(lists);
    }

    @Test
    @DisplayName("a player is granted all three, like the search endpoints")
    void given_player_should_beGranted() {
      User player = UserFixture.getUser("Pat", "Player", "pat@unittests.invalid");
      player.setTeams(new ArrayList<>(List.of(new Team())));
      when(userService.user(USER_ID)).thenReturn(player);

      assertThat(authorizer.allowedTopics(USER_ID, TENANT_ID, lists))
          .containsExactlyInAnyOrderElementsOf(lists);
    }
  }

  /**
   * The checks shared by team:, person: and organization:<id>: a row of the socket's tenant (a
   * membership for a person) and the READ check of their endpoints, open to every member.
   */
  abstract class OpenEntityDetail {

    static final String ID = "6ba7b812-9dad-11d1-80b4-00c04fd430c8";

    abstract StreamTopic topic();

    /** Stubs the existence (or membership) check for (id, tenant). */
    abstract BiConsumer<String, String> existsIn();

    @Test
    @DisplayName("a member without any capability is granted a row of the tenant")
    void given_memberWithoutCapability_should_beGranted() {
      existsIn().accept(ID, TENANT_ID);

      assertThat(allowed(viewer(Set.of(Capability.ACCESS_ASSESSMENT)), topic()))
          .containsExactly(topic());
    }

    @Test
    @DisplayName("a missing (or deleted) row is denied, even to an administrator")
    void given_missingRow_should_beDenied() {
      assertThat(allowed(admin(), topic())).isEmpty();
    }

    @Test
    @DisplayName("a row of another tenant is denied, even to an administrator")
    void given_otherTenantRow_should_beDenied() {
      existsIn().accept(ID, OTHER_TENANT_ID);

      assertThat(allowed(admin(), topic())).isEmpty();
    }
  }

  @Nested
  @DisplayName("team:<id> needs a team of the tenant")
  class TeamDetail extends OpenEntityDetail {

    @Override
    StreamTopic topic() {
      return StreamTopic.team(ID);
    }

    @Override
    BiConsumer<String, String> existsIn() {
      return (id, tenantId) -> when(teamService.existsInTenant(id, tenantId)).thenReturn(true);
    }

    @Test
    @DisplayName("an organization's id is not a team")
    void given_organizationId_should_beDenied() {
      when(organizationService.existsInTenant(ID, TENANT_ID)).thenReturn(true);

      assertThat(allowed(admin(), topic())).isEmpty();
    }
  }

  @Nested
  @DisplayName("person:<id> needs a user member of the tenant")
  class PersonDetail extends OpenEntityDetail {

    @Override
    StreamTopic topic() {
      return StreamTopic.person(ID);
    }

    @Override
    BiConsumer<String, String> existsIn() {
      return (id, tenantId) ->
          when(tenantMembershipCacheManager.existsByUserIdAndTenantId(id, tenantId))
              .thenReturn(true);
    }
  }

  @Nested
  @DisplayName("organization:<id> needs an organization of the tenant")
  class OrganizationDetail extends OpenEntityDetail {

    @Override
    StreamTopic topic() {
      return StreamTopic.organization(ID);
    }

    @Override
    BiConsumer<String, String> existsIn() {
      return (id, tenantId) ->
          when(organizationService.existsInTenant(id, tenantId)).thenReturn(true);
    }
  }

  @Nested
  @DisplayName("list:payloads needs the capability to search the whole threat arsenal")
  class ListPayloads {

    @Test
    @DisplayName("ACCESS_THREAT_ARSENALS in the tenant grants list:payloads")
    void given_accessThreatArsenals_should_beGranted() {
      assertThat(
              allowed(viewer(Set.of(Capability.ACCESS_THREAT_ARSENALS)), StreamTopic.LIST_PAYLOADS))
          .containsExactly(StreamTopic.LIST_PAYLOADS);
    }

    @Test
    @DisplayName("a user who sees threat arsenal entries only through grants is denied")
    void given_grantsOnly_should_beDenied() {
      User carol = UserFixture.getUser("Carol", "Granted", "carol@unittests.invalid");
      Group group = tenantGroup(TENANT_ID, Set.of(Capability.ACCESS_ASSETS));
      group.setGrants(
          new ArrayList<>(
              List.of(
                  GrantFixture.getGrant(
                      UUID.randomUUID().toString(),
                      Grant.GRANT_RESOURCE_TYPE.THREAT_ARSENAL,
                      Grant.GRANT_TYPE.OBSERVER,
                      group))));
      carol.setGroups(new ArrayList<>(List.of(group)));

      assertThat(allowed(carol, StreamTopic.LIST_PAYLOADS)).isEmpty();
    }

    @Test
    @DisplayName("ACCESS_THREAT_ARSENALS held in another tenant does not count")
    void given_accessThreatArsenalsInOtherTenant_should_beDenied() {
      User bob = UserFixture.getUser("Bob", "Viewer", "bob@unittests.invalid");
      bob.setGroups(
          new ArrayList<>(
              List.of(tenantGroup(OTHER_TENANT_ID, Set.of(Capability.ACCESS_THREAT_ARSENALS)))));

      assertThat(allowed(bob, StreamTopic.LIST_PAYLOADS)).isEmpty();
    }

    @Test
    @DisplayName("an administrator is granted list:payloads")
    void given_admin_should_beGranted() {
      assertThat(allowed(admin(), StreamTopic.LIST_PAYLOADS))
          .containsExactly(StreamTopic.LIST_PAYLOADS);
    }
  }

  @Nested
  @DisplayName("payload:<id> needs READ on that threat arsenal entry (contract) of the tenant")
  class PayloadDetail {

    private static final String ID = "6ba7b813-9dad-11d1-80b4-00c04fd430c8";
    private final StreamTopic topic = StreamTopic.payload(ID);

    private void payloadExistsIn(String tenantId) {
      when(injectorContractService.existsInTenant(ID, tenantId)).thenReturn(true);
    }

    @Test
    @DisplayName("a user holding ACCESS_THREAT_ARSENALS is granted a contract of the tenant")
    void given_accessThreatArsenals_should_beGranted() {
      payloadExistsIn(TENANT_ID);

      assertThat(allowed(viewer(Set.of(Capability.ACCESS_THREAT_ARSENALS)), topic))
          .containsExactly(topic);
    }

    @Test
    @DisplayName("a user with a read grant on the entry is granted")
    void given_readGrant_should_beGranted() {
      // Arrange
      payloadExistsIn(TENANT_ID);
      User carol = viewer(Set.of(Capability.ACCESS_ASSETS));
      when(grantService.hasReadGrant(ID, carol)).thenReturn(true);

      // Act & Assert
      assertThat(allowed(carol, topic)).containsExactly(topic);
    }

    @Test
    @DisplayName("a user with neither capability nor grant is denied")
    void given_noRight_should_beDenied() {
      payloadExistsIn(TENANT_ID);

      assertThat(allowed(viewer(Set.of(Capability.ACCESS_ASSETS)), topic)).isEmpty();
    }

    @Test
    @DisplayName("a player is denied")
    void given_player_should_beDenied() {
      payloadExistsIn(TENANT_ID);
      User player = UserFixture.getUser("Pat", "Player", "pat@unittests.invalid");
      player.setTeams(new ArrayList<>(List.of(new Team())));

      assertThat(allowed(player, topic)).isEmpty();
    }

    @Test
    @DisplayName("a missing (or deleted) entry is denied, even to an administrator")
    void given_missingEntry_should_beDenied() {
      assertThat(allowed(admin(), topic)).isEmpty();
      verify(grantService, never()).hasReadGrant(anyString(), any());
    }

    @Test
    @DisplayName("a contract of another tenant (same built-in id) is denied, even to an admin")
    void given_otherTenantEntry_should_beDenied() {
      payloadExistsIn(OTHER_TENANT_ID);

      assertThat(allowed(admin(), topic)).isEmpty();
    }
  }

  @Nested
  @DisplayName("list:credentials needs the search capability of the credentials endpoint")
  class ListCredentials {

    @Test
    @DisplayName("ACCESS_CREDENTIALS in the tenant grants list:credentials")
    void given_accessCredentials_should_beGranted() {
      assertThat(
              allowed(viewer(Set.of(Capability.ACCESS_CREDENTIALS)), StreamTopic.LIST_CREDENTIALS))
          .containsExactly(StreamTopic.LIST_CREDENTIALS);
    }

    @Test
    @DisplayName("ACCESS_ASSETS alone does not grant list:credentials")
    void given_accessAssetsOnly_should_beDenied() {
      assertThat(allowed(viewer(Set.of(Capability.ACCESS_ASSETS)), StreamTopic.LIST_CREDENTIALS))
          .isEmpty();
    }

    @Test
    @DisplayName("an administrator is granted list:credentials")
    void given_admin_should_beGranted() {
      assertThat(allowed(admin(), StreamTopic.LIST_CREDENTIALS))
          .containsExactly(StreamTopic.LIST_CREDENTIALS);
    }
  }

  @Nested
  @DisplayName("credential:<id> needs READ on credentials and a credential of the tenant")
  class CredentialDetail extends EntityDetail {

    @Override
    StreamTopic topic() {
      return StreamTopic.credential(ID);
    }

    @Override
    Capability readCapability() {
      return Capability.ACCESS_CREDENTIALS;
    }

    @Override
    BiConsumer<String, String> existsIn() {
      return (id, tenantId) ->
          when(credentialService.existsInTenant(id, tenantId)).thenReturn(true);
    }
  }

  @Nested
  @DisplayName("list:components needs the read capability of every components screen")
  class ListComponents {

    private static final Set<Capability> COMPONENT_CAPABILITIES =
        Set.of(
            Capability.ACCESS_DOCUMENTS,
            Capability.ACCESS_CHANNELS,
            Capability.ACCESS_CHALLENGES,
            Capability.ACCESS_PHISHING,
            Capability.ACCESS_LESSONS_LEARNED);

    @Test
    @DisplayName("every components capability in the tenant grants list:components")
    void given_everyComponentCapability_should_beGranted() {
      assertThat(allowed(viewer(COMPONENT_CAPABILITIES), StreamTopic.LIST_COMPONENTS))
          .containsExactly(StreamTopic.LIST_COMPONENTS);
    }

    @ParameterizedTest
    @EnumSource(
        value = Capability.class,
        names = {
          "ACCESS_DOCUMENTS",
          "ACCESS_CHANNELS",
          "ACCESS_CHALLENGES",
          "ACCESS_PHISHING",
          "ACCESS_LESSONS_LEARNED"
        })
    @DisplayName("missing one components capability denies list:components")
    void given_oneComponentCapabilityMissing_should_beDenied(Capability missing) {
      Set<Capability> capabilities = new HashSet<>(COMPONENT_CAPABILITIES);
      capabilities.remove(missing);

      assertThat(allowed(viewer(capabilities), StreamTopic.LIST_COMPONENTS)).isEmpty();
    }

    @Test
    @DisplayName("the components capabilities held in another tenant do not count")
    void given_capabilitiesInOtherTenant_should_beDenied() {
      User bob = UserFixture.getUser("Bob", "Viewer", "bob@unittests.invalid");
      bob.setGroups(new ArrayList<>(List.of(tenantGroup(OTHER_TENANT_ID, COMPONENT_CAPABILITIES))));

      assertThat(allowed(bob, StreamTopic.LIST_COMPONENTS)).isEmpty();
    }

    @Test
    @DisplayName("an administrator is granted list:components")
    void given_admin_should_beGranted() {
      assertThat(allowed(admin(), StreamTopic.LIST_COMPONENTS))
          .containsExactly(StreamTopic.LIST_COMPONENTS);
    }
  }

  @Nested
  @DisplayName("list:dashboards needs the search capability of the custom dashboards endpoint")
  class ListDashboards {

    @Test
    @DisplayName("ACCESS_DASHBOARDS in the tenant grants list:dashboards")
    void given_accessDashboards_should_beGranted() {
      assertThat(allowed(viewer(Set.of(Capability.ACCESS_DASHBOARDS)), StreamTopic.LIST_DASHBOARDS))
          .containsExactly(StreamTopic.LIST_DASHBOARDS);
    }

    @Test
    @DisplayName("ACCESS_REPORTINGS alone does not grant list:dashboards")
    void given_accessReportingsOnly_should_beDenied() {
      assertThat(allowed(viewer(Set.of(Capability.ACCESS_REPORTINGS)), StreamTopic.LIST_DASHBOARDS))
          .isEmpty();
    }

    @Test
    @DisplayName("ACCESS_DASHBOARDS held in another tenant does not count")
    void given_accessDashboardsInOtherTenant_should_beDenied() {
      User bob = UserFixture.getUser("Bob", "Viewer", "bob@unittests.invalid");
      bob.setGroups(
          new ArrayList<>(
              List.of(tenantGroup(OTHER_TENANT_ID, Set.of(Capability.ACCESS_DASHBOARDS)))));

      assertThat(allowed(bob, StreamTopic.LIST_DASHBOARDS)).isEmpty();
    }

    @Test
    @DisplayName("an administrator is granted list:dashboards")
    void given_admin_should_beGranted() {
      assertThat(allowed(admin(), StreamTopic.LIST_DASHBOARDS))
          .containsExactly(StreamTopic.LIST_DASHBOARDS);
    }
  }

  @Nested
  @DisplayName("dashboard:<id> needs READ on dashboards and a dashboard of the tenant")
  class DashboardDetail extends EntityDetail {

    @Override
    StreamTopic topic() {
      return StreamTopic.dashboard(ID);
    }

    @Override
    Capability readCapability() {
      return Capability.ACCESS_DASHBOARDS;
    }

    @Override
    BiConsumer<String, String> existsIn() {
      return (id, tenantId) ->
          when(customDashboardService.existsInTenant(id, tenantId)).thenReturn(true);
    }
  }

  @Nested
  @DisplayName("list:reports needs the reports capability and every reporting subject readable")
  class ListReports {

    private static final Set<Capability> EVERY_SUBJECT =
        Set.of(
            Capability.ACCESS_REPORTINGS, Capability.ACCESS_ASSESSMENT, Capability.ACCESS_ASSETS);

    @Test
    @DisplayName("the reports capability and every subject's capability grant list:reports")
    void given_reportsAndEverySubjectCapability_should_beGranted() {
      assertThat(allowed(viewer(EVERY_SUBJECT), StreamTopic.LIST_REPORTS))
          .containsExactly(StreamTopic.LIST_REPORTS);
    }

    @ParameterizedTest
    @EnumSource(
        value = Capability.class,
        names = {"ACCESS_REPORTINGS", "ACCESS_ASSESSMENT", "ACCESS_ASSETS"})
    @DisplayName("missing one of them denies list:reports, the search hiding some reportings")
    void given_oneCapabilityMissing_should_beDenied(Capability missing) {
      Set<Capability> capabilities = new HashSet<>(EVERY_SUBJECT);
      capabilities.remove(missing);

      assertThat(allowed(viewer(capabilities), StreamTopic.LIST_REPORTS)).isEmpty();
    }

    @Test
    @DisplayName("a user who reads scenarios only through grants is denied")
    void given_scenarioGrantsOnly_should_beDenied() {
      // Arrange
      Group group =
          tenantGroup(TENANT_ID, Set.of(Capability.ACCESS_REPORTINGS, Capability.ACCESS_ASSETS));
      Grant grant =
          GrantFixture.getGrant(
              UUID.randomUUID().toString(),
              Grant.GRANT_RESOURCE_TYPE.SCENARIO,
              Grant.GRANT_TYPE.OBSERVER,
              group);
      group.setGrants(new ArrayList<>(List.of(grant)));
      User carol = UserFixture.getUser("Carol", "Granted", "carol@unittests.invalid");
      carol.setGroups(new ArrayList<>(List.of(group)));

      // Act & Assert
      assertThat(allowed(carol, StreamTopic.LIST_REPORTS)).isEmpty();
    }

    @Test
    @DisplayName("an administrator is granted list:reports")
    void given_admin_should_beGranted() {
      assertThat(allowed(admin(), StreamTopic.LIST_REPORTS))
          .containsExactly(StreamTopic.LIST_REPORTS);
    }
  }

  @Nested
  @DisplayName(
      "report:<id> needs READ on reports, a reporting of the tenant and READ on its subject")
  class ReportDetail {

    private static final String ID = "6ba7b814-9dad-11d1-80b4-00c04fd430c8";
    private static final String SCENARIO_ID = "6ba7b815-9dad-11d1-80b4-00c04fd430c8";
    private final StreamTopic topic = StreamTopic.report(ID);

    private void reportingExistsIn(String tenantId, ReportingContextType type, String contextId) {
      Reporting reporting = new Reporting();
      reporting.setId(ID);
      reporting.setContextType(type);
      reporting.setContextId(contextId);
      when(reportingRepository.findByIdAndTenantId(ID, tenantId))
          .thenReturn(Optional.of(reporting));
    }

    @Test
    @DisplayName("ACCESS_REPORTINGS grants a platform-wide reporting of the tenant")
    void given_accessReportingsOnPlatformReporting_should_beGranted() {
      reportingExistsIn(TENANT_ID, ReportingContextType.PLATFORM, null);

      assertThat(allowed(viewer(Set.of(Capability.ACCESS_REPORTINGS)), topic))
          .containsExactly(topic);
    }

    @Test
    @DisplayName("a scenario reporting is denied without READ on the scenario")
    void given_scenarioReportingWithoutScenarioRead_should_beDenied() {
      reportingExistsIn(TENANT_ID, ReportingContextType.SCENARIO, SCENARIO_ID);

      assertThat(allowed(viewer(Set.of(Capability.ACCESS_REPORTINGS)), topic)).isEmpty();
    }

    @Test
    @DisplayName("a scenario reporting is granted with a read grant on the scenario")
    void given_scenarioReportingWithScenarioGrant_should_beGranted() {
      // Arrange
      reportingExistsIn(TENANT_ID, ReportingContextType.SCENARIO, SCENARIO_ID);
      User carol = viewer(Set.of(Capability.ACCESS_REPORTINGS));
      when(grantService.hasReadGrant(SCENARIO_ID, carol)).thenReturn(true);

      // Act & Assert
      assertThat(allowed(carol, topic)).containsExactly(topic);
    }

    @Test
    @DisplayName("without the reports capability nothing is looked up")
    void given_noReportsCapability_should_beDeniedWithoutQuery() {
      reportingExistsIn(TENANT_ID, ReportingContextType.PLATFORM, null);

      assertThat(allowed(viewer(Set.of(Capability.ACCESS_ASSESSMENT)), topic)).isEmpty();
      verify(reportingRepository, never()).findByIdAndTenantId(anyString(), anyString());
    }

    @Test
    @DisplayName("a missing (or deleted) reporting is denied, even to an administrator")
    void given_missingReporting_should_beDenied() {
      when(reportingRepository.findByIdAndTenantId(ID, TENANT_ID)).thenReturn(Optional.empty());

      assertThat(allowed(admin(), topic)).isEmpty();
    }

    @Test
    @DisplayName("a reporting of another tenant is denied, even to an administrator")
    void given_otherTenantReporting_should_beDenied() {
      reportingExistsIn(OTHER_TENANT_ID, ReportingContextType.PLATFORM, null);

      assertThat(allowed(admin(), topic)).isEmpty();
    }
  }

  @Nested
  @DisplayName("list:analytics needs the capability of the widget data endpoints")
  class ListAnalytics {

    @ParameterizedTest
    @EnumSource(
        value = Capability.class,
        names = {"ACCESS_DASHBOARDS", "ACCESS_TENANT_SETTINGS"})
    @DisplayName("READ on dashboards or on tenant settings grants list:analytics")
    void given_widgetDataCapability_should_beGranted(Capability capability) {
      assertThat(allowed(viewer(Set.of(capability)), StreamTopic.LIST_ANALYTICS))
          .containsExactly(StreamTopic.LIST_ANALYTICS);
    }

    @Test
    @DisplayName("a user reading simulation statistics only (ACCESS_ASSESSMENT) is denied")
    void given_accessAssessmentOnly_should_beDenied() {
      assertThat(allowed(viewer(Set.of(Capability.ACCESS_ASSESSMENT)), StreamTopic.LIST_ANALYTICS))
          .isEmpty();
    }

    @Test
    @DisplayName("ACCESS_DASHBOARDS held in another tenant does not count")
    void given_accessDashboardsInOtherTenant_should_beDenied() {
      User bob = UserFixture.getUser("Bob", "Viewer", "bob@unittests.invalid");
      bob.setGroups(
          new ArrayList<>(
              List.of(tenantGroup(OTHER_TENANT_ID, Set.of(Capability.ACCESS_DASHBOARDS)))));

      assertThat(allowed(bob, StreamTopic.LIST_ANALYTICS)).isEmpty();
    }

    @Test
    @DisplayName("a player is denied")
    void given_player_should_beDenied() {
      User player = UserFixture.getUser("Pat", "Player", "pat@unittests.invalid");
      player.setTeams(new ArrayList<>(List.of(new Team())));

      assertThat(allowed(player, StreamTopic.LIST_ANALYTICS)).isEmpty();
    }
  }
}
