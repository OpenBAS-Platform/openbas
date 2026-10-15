package io.openaev.rest.inject;

import static io.openaev.injectors.challenge.ChallengeContract.CHALLENGE_PUBLISH;
import static io.openaev.integration.impl.injectors.challenge.ChallengeInjectorIntegration.CHALLENGE_INJECTOR_ID;
import static io.openaev.utils.InjectContentUtils.MANUAL_TARGETS_CONTENT_KEY;
import static io.openaev.utils.InjectContentUtils.MANUAL_TARGET_SELECTOR;
import static io.openaev.utils.InjectContentUtils.TARGET_SELECTOR_CONTENT_KEY;
import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openaev.IntegrationTest;
import io.openaev.context.TenantContext;
import io.openaev.database.model.Exercise;
import io.openaev.database.model.Finding;
import io.openaev.database.model.Inject;
import io.openaev.database.model.InjectorContract;
import io.openaev.database.model.InjectorContractId;
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
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

/**
 * The four native reads of {@code injects} that carry no tenant predicate of their own return the
 * rows of the transaction scope once the table is v2-active, whatever the ambient tenant.
 *
 * <p>The scope is tenant B and the thread-local is a third tenant C, the shape of a background path
 * or of the non-prefixed route, where the two disagree. Each test also seeds a row in C that would
 * match the query, so a read that followed the thread-local, or that was not scoped at all, fails
 * on a wrong row and not only on a missing one. Two of the decoys hang off B's simulation through a
 * tenant C inject, so the simulation id alone does not confine the result either.
 *
 * <p>{@code findings} is armed as in production: two of the reads reach injects through it.
 */
@Transactional
@TestPropertySource(properties = "openaev.tenant.active-tables=injects,findings")
@WithMockUser(isAdmin = true)
@DisplayName("Native inject reads follow the transaction scope, not the ambient tenant")
class InjectNativeReadsScopeTest extends IntegrationTest {

  @Autowired private InjectRepository injectRepository;
  @Autowired private FindingRepository findingRepository;
  @Autowired private ExerciseComposer exerciseComposer;
  @Autowired private TenantIsolationTestHelper tenantHelper;
  @Autowired private EntityManager entityManager;
  @Autowired private ObjectMapper objectMapper;

  private String tenantB;
  private String tenantC;
  private Exercise exerciseB;
  private String marker;

  @BeforeEach
  void seedTwoTenantsAndASimulationInB() throws Exception {
    exerciseComposer.reset();
    tenantB = tenantHelper.createTenant("inject-reads-b").getId();
    tenantC = tenantHelper.createTenant("inject-reads-c").getId();
    DefaultTenantScopeTestListener.setAmbientScope(entityManager, tenantB + "," + tenantC);
    marker = UUID.randomUUID().toString();
    TenantContext.setCurrentTenant(tenantB);
    exerciseB =
        exerciseComposer.forExercise(ExerciseFixture.createDefaultExercise()).persist().get();
  }

  @AfterEach
  void clearAmbientTenant() {
    TenantContext.clearCurrentTenant();
  }

  @Nested
  @DisplayName("Injects publishing a challenge")
  class ChallengeIds {

    @Test
    @DisplayName("given_scopeB_and_ambientC_should_returnOnlyTheInjectsOfB")
    void given_scopeB_and_ambientC_should_returnOnlyTheInjectsOfB() {
      // Arrange
      Inject injectB = saveChallengeInject(tenantB);
      saveChallengeInject(tenantC);
      readUnderScopeBWithAmbientC();

      // Act
      List<String> ids = injectRepository.findAllIdsForChallengeId("%" + marker + "%");

      // Assert
      assertThat(ids).containsExactly(injectB.getId());
    }
  }

  @Nested
  @DisplayName("Inject options linked to findings")
  class LinkedToFindings {

    @Test
    @DisplayName("given_scopeB_and_ambientC_should_returnOnlyTheInjectsOfB")
    void given_scopeB_and_ambientC_should_returnOnlyTheInjectsOfB() {
      // Arrange
      Inject injectB = saveInjectWithFinding(tenantB, null);
      saveInjectWithFinding(tenantC, null);
      readUnderScopeBWithAmbientC();

      // Act
      List<Object[]> rows =
          injectRepository.findAllByTitleLinkedToFindings(marker, PageRequest.of(0, 50));

      // Assert
      assertThat(rows).extracting(row -> row[0]).containsExactly(injectB.getId());
    }

    @Test
    @DisplayName("given_scopeB_and_ambientC_and_simulationContext_should_returnOnlyTheInjectsOfB")
    void given_scopeB_and_ambientC_and_simulationContext_should_returnOnlyTheInjectsOfB() {
      // Arrange
      Inject injectB = saveInjectWithFinding(tenantB, exerciseB);
      saveInjectWithFinding(tenantC, exerciseB);
      readUnderScopeBWithAmbientC();

      // Act
      List<Object[]> rows =
          injectRepository.findAllByTitleLinkedToFindingsWithContext(
              exerciseB.getId(), marker, PageRequest.of(0, 50));

      // Assert
      assertThat(rows).extracting(row -> row[0]).containsExactly(injectB.getId());
    }
  }

  @Nested
  @DisplayName("Content-based targets of a simulation")
  class ContentTargets {

    @Test
    @DisplayName("given_scopeB_and_ambientC_should_returnOnlyTheContentOfB")
    void given_scopeB_and_ambientC_should_returnOnlyTheContentOfB() {
      // Arrange
      saveManualTargetInject(tenantB, "target-b-" + marker);
      saveManualTargetInject(tenantC, "target-c-" + marker);
      readUnderScopeBWithAmbientC();

      // Act
      List<Object[]> rows =
          injectRepository.findContentTargetContentsByExerciseIds(Set.of(exerciseB.getId()));

      // Assert
      assertThat(rows).hasSize(1);
      assertThat(rows.getFirst()[0]).isEqualTo(exerciseB.getId());
      assertThat((String) rows.getFirst()[1])
          .contains("target-b-" + marker)
          .doesNotContain("target-c-" + marker);
    }
  }

  private void readUnderScopeBWithAmbientC() {
    entityManager.flush();
    entityManager.clear();
    DefaultTenantScopeTestListener.setAmbientScope(entityManager, tenantB);
    TenantContext.setCurrentTenant(tenantC);
  }

  /**
   * The query keys on the challenge injector's id, not on {@code CHALLENGE_PUBLISH}, the contract
   * the challenge injects actually carry, so it matches no inject of a real platform. The contract
   * is copied under that id here so the tenant behaviour of the query can be observed at all.
   */
  private Inject saveChallengeInject(String tenantId) {
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
    return injectRepository.save(
        InjectFixture.createDefaultInjectChallenge(contract, objectMapper, List.of(marker)));
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

  private void saveManualTargetInject(String tenantId, String target) {
    TenantContext.setCurrentTenant(tenantId);
    ObjectNode content = objectMapper.createObjectNode();
    content.put(TARGET_SELECTOR_CONTENT_KEY, MANUAL_TARGET_SELECTOR);
    content.put(MANUAL_TARGETS_CONTENT_KEY, target);
    Inject inject = InjectFixture.getDefaultInject();
    inject.setExercise(exerciseB);
    inject.setContent(content);
    injectRepository.save(inject);
  }
}
