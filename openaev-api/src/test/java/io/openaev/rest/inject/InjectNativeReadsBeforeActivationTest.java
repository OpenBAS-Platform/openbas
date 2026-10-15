package io.openaev.rest.inject;

import static io.openaev.injectors.challenge.ChallengeContract.CHALLENGE_PUBLISH;
import static io.openaev.integration.impl.injectors.challenge.ChallengeInjectorIntegration.CHALLENGE_INJECTOR_ID;
import static io.openaev.rest.challenge.ChallengeApi.TENANT_CHALLENGE_URI;
import static io.openaev.rest.inject.InjectApi.INJECT_URI;
import static io.openaev.rest.inject.InjectApi.TENANT_INJECT_URI;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import io.openaev.IntegrationTest;
import io.openaev.context.TenantContext;
import io.openaev.database.model.Exercise;
import io.openaev.database.model.Finding;
import io.openaev.database.model.Inject;
import io.openaev.database.model.InjectorContract;
import io.openaev.database.model.InjectorContractId;
import io.openaev.database.model.Tenant;
import io.openaev.database.repository.FindingRepository;
import io.openaev.database.repository.InjectRepository;
import io.openaev.utils.TenantIsolationTestHelper;
import io.openaev.utils.fixtures.ExerciseFixture;
import io.openaev.utils.fixtures.FindingFixture;
import io.openaev.utils.fixtures.InjectFixture;
import io.openaev.utils.fixtures.composers.ExerciseComposer;
import io.openaev.utils.mockUser.WithMockUser;
import io.openaev.utilstest.DefaultTenantScopeTestListener;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * While {@code injects} is still on the v1 filter, the native reads that carry no tenant predicate
 * of their own stay confined to the caller's tenant through what they join or load: the findings
 * options through {@code findings}, which is v2-active, and the simulations of a challenge through
 * the inject entities they are loaded as, which the v1 filter confines.
 *
 * <p>Only the tables these reads depend on are armed, both active in production; {@code injects} is
 * not. Tenant C holds a matching row each time, so a read that is not confined fails on a wrong
 * row.
 */
@Transactional
@TestPropertySource(properties = "openaev.tenant.active-tables=challenges,findings")
@WithMockUser(isAdmin = true)
@DisplayName("Native inject reads stay in the caller's tenant before injects is activated")
class InjectNativeReadsBeforeActivationTest extends IntegrationTest {

  private static final String TENANT_HEADER = "X-Tenant-Ids";
  private static final String FINDINGS_OPTIONS = "/findings/options";

  @Autowired private MockMvc mvc;
  @Autowired private InjectRepository injectRepository;
  @Autowired private FindingRepository findingRepository;
  @Autowired private ExerciseComposer exerciseComposer;
  @Autowired private TenantIsolationTestHelper tenantHelper;
  @Autowired private EntityManager entityManager;
  @Autowired private ObjectMapper objectMapper;

  private String tenantB;
  private String tenantC;
  private Exercise exerciseB;
  private Exercise exerciseC;
  private String marker;

  @BeforeEach
  void seedTwoTenantsWithASimulationEach() throws Exception {
    exerciseComposer.reset();
    tenantB = tenantHelper.createTenantWithCurrentUser("inject-reads-v1-b").getId();
    tenantC = tenantHelper.createTenantWithCurrentUser("inject-reads-v1-c").getId();
    DefaultTenantScopeTestListener.setAmbientScope(entityManager, tenantB + "," + tenantC);
    marker = UUID.randomUUID().toString();
    exerciseB = saveExercise(tenantB);
    exerciseC = saveExercise(tenantC);
  }

  @AfterEach
  void clearAmbientTenant() {
    TenantContext.clearCurrentTenant();
  }

  @Nested
  @DisplayName("Simulations publishing a challenge")
  class ChallengeSimulations {

    @Test
    @DisplayName("given_injectOfTenantCPublishingTheChallenge_should_listOnlyTheSimulationOfB")
    void given_injectOfTenantCPublishingTheChallenge_should_listOnlyTheSimulationOfB()
        throws Exception {
      // Arrange
      String challengeB = seedChallenge(tenantB);
      saveChallengeInject(tenantB, exerciseB, challengeB);
      saveChallengeInject(tenantC, exerciseC, challengeB);
      flushAndClear();

      // Act
      String response =
          mvc.perform(get(TENANT_CHALLENGE_URI, tenantB))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      // Assert
      List<String> simulations =
          JsonPath.read(
              response, "$[?(@.challenge_id == '" + challengeB + "')].challenge_exercises[*]");
      assertThat(simulations).containsExactly(exerciseB.getId());
    }
  }

  @Nested
  @DisplayName("Inject options linked to findings")
  class LinkedToFindings {

    @Test
    @DisplayName("given_prefixedRouteB_should_returnOnlyTheInjectsOfB")
    void given_prefixedRouteB_should_returnOnlyTheInjectsOfB() throws Exception {
      // Arrange
      Inject injectB = saveInjectWithFinding(tenantB, exerciseB);
      Inject injectC = saveInjectWithFinding(tenantC, exerciseC);
      flushAndClear();

      // Act
      String response =
          mvc.perform(
                  get(TENANT_INJECT_URI + FINDINGS_OPTIONS, tenantB).param("searchText", marker))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      // Assert
      assertThat(optionIds(response)).contains(injectB.getId()).doesNotContain(injectC.getId());
    }

    @Test
    @DisplayName("given_prefixedRouteB_and_simulationOfB_should_returnOnlyTheInjectsOfB")
    void given_prefixedRouteB_and_simulationOfB_should_returnOnlyTheInjectsOfB() throws Exception {
      // Arrange
      Inject injectB = saveInjectWithFinding(tenantB, exerciseB);
      // A tenant C inject hanging off B's simulation: the simulation id alone does not confine it.
      Inject injectC = saveInjectWithFinding(tenantC, exerciseB);
      flushAndClear();

      // Act
      String response =
          mvc.perform(
                  get(TENANT_INJECT_URI + FINDINGS_OPTIONS, tenantB)
                      .param("searchText", marker)
                      .param("sourceId", exerciseB.getId()))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      // Assert
      assertThat(optionIds(response)).contains(injectB.getId()).doesNotContain(injectC.getId());
    }

    @Test
    @DisplayName("given_headerRouteB_should_returnOnlyTheInjectsOfB")
    void given_headerRouteB_should_returnOnlyTheInjectsOfB() throws Exception {
      // Arrange
      Inject injectB = saveInjectWithFinding(tenantB, exerciseB);
      Inject injectC = saveInjectWithFinding(tenantC, exerciseC);
      flushAndClear();
      // The header route sets no ambient tenant: production's thread-local is empty there and
      // falls back to the default tenant, which must not be what decides the result.
      TenantContext.clearCurrentTenant();
      assertThat(TenantContext.getCurrentTenant()).isEqualTo(Tenant.DEFAULT_TENANT_UUID);

      // Act
      String response =
          mvc.perform(
                  get(INJECT_URI + FINDINGS_OPTIONS)
                      .header(TENANT_HEADER, tenantB)
                      .param("searchText", marker))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      // Assert
      assertThat(optionIds(response)).contains(injectB.getId()).doesNotContain(injectC.getId());
    }
  }

  private Exercise saveExercise(String tenantId) {
    TenantContext.setCurrentTenant(tenantId);
    return exerciseComposer.forExercise(ExerciseFixture.createDefaultExercise()).persist().get();
  }

  private String seedChallenge(String tenantId) {
    String id = UUID.randomUUID().toString();
    entityManager
        .createNativeQuery(
            "INSERT INTO challenges"
                + " (challenge_id, challenge_name, challenge_category, challenge_content,"
                + "  challenge_score, challenge_max_attempts, tenant_id)"
                + " VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)")
        .setParameter(1, id)
        .setParameter(2, "challenge-" + marker)
        .setParameter(3, "cat")
        .setParameter(4, "content")
        .setParameter(5, 10.0)
        .setParameter(6, 3)
        .setParameter(7, tenantId)
        .executeUpdate();
    return id;
  }

  /**
   * The challenge read keys on the challenge injector's id, not on {@code CHALLENGE_PUBLISH}, the
   * contract the challenge injects actually carry, so it matches no inject of a real platform. The
   * contract is copied under that id here so the confinement of the read can be observed at all.
   */
  private void saveChallengeInject(String tenantId, Exercise exercise, String challengeId) {
    // A primary-key load: a JPQL lookup would go through the v1 filter of whichever tenant armed
    // it.
    InjectorContract contract =
        entityManager.find(
            InjectorContract.class, new InjectorContractId(CHALLENGE_PUBLISH, tenantId));
    assertThat(contract).as("challenge contract provisioned for " + tenantId).isNotNull();
    entityManager.detach(contract);
    contract.setId(CHALLENGE_INJECTOR_ID);
    contract.setInjectorLinks(new ArrayList<>());
    entityManager.persist(contract);
    TenantContext.setCurrentTenant(tenantId);
    Inject inject =
        InjectFixture.createDefaultInjectChallenge(contract, objectMapper, List.of(challengeId));
    inject.setExercise(exercise);
    injectRepository.save(inject);
  }

  private Inject saveInjectWithFinding(String tenantId, Exercise exercise) {
    TenantContext.setCurrentTenant(tenantId);
    Inject inject = InjectFixture.getDefaultInject();
    inject.setTitle("linked-" + marker);
    inject.setExercise(exercise);
    inject = injectRepository.save(inject);
    Finding finding = FindingFixture.createDefaultTextFindingWithRandomValue();
    finding.setInject(inject);
    findingRepository.save(finding);
    return inject;
  }

  private void flushAndClear() {
    entityManager.flush();
    entityManager.clear();
  }

  private static List<String> optionIds(String response) {
    return JsonPath.read(response, "$[*].id");
  }
}
