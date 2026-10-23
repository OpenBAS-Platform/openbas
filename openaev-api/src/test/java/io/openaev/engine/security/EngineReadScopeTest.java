package io.openaev.engine.security;

import static org.assertj.core.api.Assertions.assertThat;

import io.openaev.database.model.Tenant;
import io.openaev.engine.model.finding.EsFinding;
import io.openaev.engine.model.injectexpectation.EsInjectExpectation;
import io.openaev.engine.model.snapshotobservation.EsAttackObservation;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * {@link EngineReadScope#stripHiddenAssets}: a returned document keeps its visible asset references
 * and loses the hidden ones. Security platforms are assets, so a hidden platform goes from the
 * expectations and observations it reported on.
 */
@DisplayName("Engine read scope: hidden asset references removed from returned documents")
class EngineReadScopeTest {

  private static final String VISIBLE = "visible-asset";
  private static final String HIDDEN = "hidden-asset";

  private static final EngineReadScope HIDING =
      EngineReadScope.forTenant(Tenant.DEFAULT_TENANT_UUID, Set.of(), Map.of(), Set.of(HIDDEN));

  @Nested
  @DisplayName("Security platforms")
  class SecurityPlatforms {

    @Test
    @DisplayName("given a hidden platform on an expectation, should keep only the visible one")
    void given_hiddenPlatformOnExpectation_should_keepOnlyTheVisibleOne() {
      // -- ARRANGE --
      EsInjectExpectation expectation = new EsInjectExpectation();
      expectation.setBase_security_platforms_side(Set.of(VISIBLE, HIDDEN));

      // -- ACT --
      HIDING.stripHiddenAssets(expectation);

      // -- ASSERT --
      assertThat(expectation.getBase_security_platforms_side()).containsExactly(VISIBLE);
    }

    @Test
    @DisplayName(
        "given a hidden platform on an observation, should drop it from reporting and succeeded")
    void given_hiddenPlatformOnObservation_should_dropItFromBothFields() {
      // -- ARRANGE --
      EsAttackObservation observation = new EsAttackObservation();
      observation.setBase_security_platforms_side(Set.of(VISIBLE, HIDDEN));
      observation.setAttack_observation_platforms_succeeded(Set.of(VISIBLE, HIDDEN));

      // -- ACT --
      HIDING.stripHiddenAssets(observation);

      // -- ASSERT --
      assertThat(observation.getBase_security_platforms_side()).containsExactly(VISIBLE);
      assertThat(observation.getAttack_observation_platforms_succeeded()).containsExactly(VISIBLE);
    }

    @Test
    @DisplayName("given an unrestricted reader, should keep every platform")
    void given_unrestrictedReader_should_keepEveryPlatform() {
      // -- ARRANGE --
      EsAttackObservation observation = new EsAttackObservation();
      observation.setBase_security_platforms_side(Set.of(VISIBLE, HIDDEN));
      observation.setAttack_observation_platforms_succeeded(Set.of(HIDDEN));

      // -- ACT --
      EngineReadScope.unrestricted(null).stripHiddenAssets(observation);

      // -- ASSERT --
      assertThat(observation.getBase_security_platforms_side())
          .containsExactlyInAnyOrder(VISIBLE, HIDDEN);
      assertThat(observation.getAttack_observation_platforms_succeeded()).containsExactly(HIDDEN);
    }
  }

  @Test
  @DisplayName("given a finding on a visible and a hidden endpoint, should keep the visible one")
  void given_findingOnVisibleAndHidden_should_keepTheVisibleEndpoint() {
    // -- ARRANGE --
    EsFinding finding = new EsFinding();
    finding.setBase_endpoint_side(Set.of(VISIBLE, HIDDEN));

    // -- ACT --
    HIDING.stripHiddenAssets(finding);

    // -- ASSERT --
    assertThat(finding.getBase_endpoint_side()).containsExactly(VISIBLE);
  }
}
