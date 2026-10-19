package io.openaev.stream;

import static org.assertj.core.api.Assertions.assertThat;

import io.openaev.IntegrationTest;
import java.util.Arrays;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.TestPropertySource;

/** With STREAM_INVALIDATION off, the whole application holds no bean of the stream package. */
@TestPropertySource(properties = "openaev.enabled-dev-features=MARKING")
@DisplayName("Stream WebSocket: feature off")
class StreamInvalidationDisabledIntegrationTest extends IntegrationTest {

  @Autowired private ApplicationContext context;

  @Test
  @DisplayName("given the feature off, no bean of io.openaev.stream and no WebSocket mapping exist")
  void given_featureOff_should_registerNoStreamBean() {
    assertThat(
            Arrays.stream(context.getBeanDefinitionNames())
                .filter(
                    name -> {
                      Class<?> type = context.getType(name);
                      return type != null && type.getName().startsWith("io.openaev.stream.");
                    })
                .toList())
        .isEmpty();
    assertThat(context.containsBean("webSocketHandlerMapping")).isFalse();
  }
}
