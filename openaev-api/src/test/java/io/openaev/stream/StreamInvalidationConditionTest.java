package io.openaev.stream;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.env.MockEnvironment;

@DisplayName("StreamInvalidationCondition: the STREAM_INVALIDATION preview feature gate")
class StreamInvalidationConditionTest {

  @ParameterizedTest
  @ValueSource(
      strings = {
        "STREAM_INVALIDATION",
        "stream_invalidation",
        "MARKING, STREAM_INVALIDATION",
        "*",
        "MARKING,*"
      })
  @DisplayName("the feature, in any case, or the wildcard turns it on")
  void given_featureListed_should_beEnabled(String features) {
    MockEnvironment env =
        new MockEnvironment().withProperty("openaev.enabled-dev-features", features);

    assertThat(StreamInvalidationCondition.isEnabled(env)).isTrue();
  }

  @ParameterizedTest
  @ValueSource(
      strings = {"", " ", "MARKING", "STREAM_INVALIDATIONS", "MARKING,BULK_SNAPSHOT_EXPORT"})
  @DisplayName("anything else leaves it off")
  void given_featureNotListed_should_beDisabled(String features) {
    MockEnvironment env =
        new MockEnvironment().withProperty("openaev.enabled-dev-features", features);

    assertThat(StreamInvalidationCondition.isEnabled(env)).isFalse();
  }

  @Test
  @DisplayName("no property leaves it off")
  void given_noProperty_should_beDisabled() {
    assertThat(StreamInvalidationCondition.isEnabled(new MockEnvironment())).isFalse();
  }

  @Test
  @DisplayName("the legacy openbas key wins, as in the platform settings")
  void given_legacyKey_should_win() {
    MockEnvironment env =
        new MockEnvironment()
            .withProperty("openbas.enabled-dev-features", "STREAM_INVALIDATION")
            .withProperty("openaev.enabled-dev-features", "");

    assertThat(StreamInvalidationCondition.isEnabled(env)).isTrue();
  }
}
