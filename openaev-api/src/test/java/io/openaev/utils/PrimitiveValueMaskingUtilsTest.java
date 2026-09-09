package io.openaev.utils;

import static org.junit.jupiter.api.Assertions.*;

import io.openaev.database.model.PrimitiveType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("PrimitiveValueMaskingUtils")
class PrimitiveValueMaskingUtilsTest {

  @Test
  @DisplayName("should mask password/hash/key with a fixed width mask keeping a short fragment")
  void shouldMaskSensitiveValues() {
    assertEquals(
        "Se******", PrimitiveValueMaskingUtils.maskForDisplay(PrimitiveType.Password, "Secret13"));
    assertEquals(
        "AB******", PrimitiveValueMaskingUtils.maskForDisplay(PrimitiveType.Hash, "ABC123XYZ"));
    assertEquals(
        "KE******", PrimitiveValueMaskingUtils.maskForDisplay(PrimitiveType.Key, "KEY123456890"));
  }

  @Test
  @DisplayName("should keep non-sensitive values unchanged")
  void shouldKeepNonSensitiveValues() {
    assertEquals("plain", PrimitiveValueMaskingUtils.maskForDisplay(PrimitiveType.Text, "plain"));
  }

  @Test
  @DisplayName("should detect masked echoes")
  void shouldDetectMaskedEchoes() {
    assertTrue(
        PrimitiveValueMaskingUtils.isMaskedRepresentationOfCurrentValue(
            PrimitiveType.Password, "TopSecret", "To******"));
    assertFalse(
        PrimitiveValueMaskingUtils.isMaskedRepresentationOfCurrentValue(
            PrimitiveType.Password, "TopSecret", "TopSecret"));
  }
}
