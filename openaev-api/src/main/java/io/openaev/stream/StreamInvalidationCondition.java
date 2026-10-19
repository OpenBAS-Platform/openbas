package io.openaev.stream;

import io.openaev.rest.settings.PreviewFeature;
import java.util.Arrays;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.env.Environment;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.util.StringUtils;

/**
 * Registers the live-invalidation stream only when {@link PreviewFeature#STREAM_INVALIDATION} is
 * enabled, so that with the feature off the WebSocket endpoint, the listener and the scheduled
 * tasks do not exist at all.
 *
 * <p>Parsing mirrors {@code PlatformSettingsService} (which feeds the front end's {@code
 * isFeatureEnabled}): {@code openaev.enabled-dev-features} is a comma-separated, case-insensitive
 * list, {@link PreviewFeature#FEATURE_FLAG_ALL} enables every preview feature, and the legacy
 * {@code openbas.} key wins when set. The predicate reads the {@link Environment} directly because
 * a condition runs before any bean, {@code PreviewFeatureService} included, exists.
 */
public class StreamInvalidationCondition implements Condition {

  @Override
  public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
    return isEnabled(context.getEnvironment());
  }

  /** The predicate, testable without a Spring context. */
  public static boolean isEnabled(Environment env) {
    String enabledDevFeatures =
        env.getProperty(
            "openbas.enabled-dev-features", env.getProperty("openaev.enabled-dev-features", ""));
    if (!StringUtils.hasText(enabledDevFeatures)) {
      return false;
    }
    return Arrays.stream(enabledDevFeatures.split(","))
        .map(String::strip)
        .anyMatch(
            token ->
                token.equalsIgnoreCase(PreviewFeature.FEATURE_FLAG_ALL.getValue())
                    || token.equalsIgnoreCase(PreviewFeature.STREAM_INVALIDATION.getValue()));
  }
}
