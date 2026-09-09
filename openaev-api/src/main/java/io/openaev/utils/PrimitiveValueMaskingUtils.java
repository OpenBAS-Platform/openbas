package io.openaev.utils;

import io.openaev.database.model.PrimitiveType;
import io.openaev.helper.SensitiveValueMaskingUtils;

/**
 * Masking of chaining engine / attack path values.
 *
 * <p>This is a thin adapter over {@link SensitiveValueMaskingUtils}, which owns the one masking
 * policy of the platform: the chaining engine and the findings API must not disclose the same
 * secret in two different, independently reversible ways.
 */
public final class PrimitiveValueMaskingUtils {

  private PrimitiveValueMaskingUtils() {}

  public static String maskForDisplay(PrimitiveType type, String value) {
    return SensitiveValueMaskingUtils.maskIfNeeded(type, value);
  }

  public static boolean isMaskedRepresentationOfCurrentValue(
      PrimitiveType type, String rawValue, String candidateValue) {
    if (type == null || rawValue == null || candidateValue == null) {
      return false;
    }
    return maskForDisplay(type, rawValue).equals(candidateValue);
  }
}
