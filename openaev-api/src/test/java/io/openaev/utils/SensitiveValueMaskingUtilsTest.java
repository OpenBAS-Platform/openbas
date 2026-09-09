package io.openaev.utils;

import static org.assertj.core.api.Assertions.assertThat;

import io.openaev.database.model.ContractOutputType;
import io.openaev.database.model.PrimitiveType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("Sensitive value masking")
class SensitiveValueMaskingUtilsTest {

  private static final String MASK = SensitiveValueMaskingUtils.MASK;

  @Nested
  @DisplayName("When deriving sensitivity from a contract output type")
  class WhenDerivingSensitivity {

    @Test
    @DisplayName("Should flag the types whose recipe holds a password or a hash")
    void given_aTypeHoldingSecretMaterial_should_flagItSensitive() {
      // -------- Act & Assert --------
      // Credentials carry `password` + `hash`, the roastable accounts carry a `hash` that is
      // crackable offline: all three are secret material.
      assertThat(SensitiveValueMaskingUtils.isSensitive(ContractOutputType.Credentials)).isTrue();
      assertThat(SensitiveValueMaskingUtils.isSensitive(ContractOutputType.AsreproastableAccount))
          .isTrue();
      assertThat(SensitiveValueMaskingUtils.isSensitive(ContractOutputType.KerberoastableAccount))
          .isTrue();
    }

    @Test
    @DisplayName("Should not flag types carrying no secret material")
    void given_aTypeWithoutSecretMaterial_should_notFlagItSensitive() {
      // -------- Act & Assert --------
      assertThat(SensitiveValueMaskingUtils.isSensitive(ContractOutputType.Text)).isFalse();
      assertThat(SensitiveValueMaskingUtils.isSensitive(ContractOutputType.Port)).isFalse();
      assertThat(SensitiveValueMaskingUtils.isSensitive(ContractOutputType.IPv4)).isFalse();
      assertThat(SensitiveValueMaskingUtils.isSensitive(ContractOutputType.PortsScan)).isFalse();
    }

    @Test
    @DisplayName("Should never flag a password policy, whose `key` is a setting name")
    void given_aPasswordPolicy_should_notFlagItSensitive() {
      // -------- Arrange --------
      // PasswordPolicy decomposes into PrimitiveType.Key, but that key is a policy setting name
      // (MinimumPasswordLength...), not a cryptographic key: masking it would hide the very
      // information the finding reports.

      // -------- Act & Assert --------
      assertThat(SensitiveValueMaskingUtils.isSensitive(ContractOutputType.PasswordPolicy))
          .isFalse();
      assertThat(
              SensitiveValueMaskingUtils.maskIfNeeded(
                  ContractOutputType.PasswordPolicy, "MinimumPasswordLength:8"))
          .isEqualTo("MinimumPasswordLength:8");
    }

    @Test
    @DisplayName("Should flag the primitive types holding secret material")
    void given_aPrimitiveType_should_flagOnlySecretOnes() {
      // -------- Act & Assert --------
      assertThat(SensitiveValueMaskingUtils.isSensitive(PrimitiveType.Password)).isTrue();
      assertThat(SensitiveValueMaskingUtils.isSensitive(PrimitiveType.Hash)).isTrue();
      assertThat(SensitiveValueMaskingUtils.isSensitive(PrimitiveType.Key)).isTrue();
      assertThat(SensitiveValueMaskingUtils.isSensitive(PrimitiveType.Username)).isFalse();
      assertThat(SensitiveValueMaskingUtils.isSensitive(PrimitiveType.Text)).isFalse();
    }

    @Test
    @DisplayName("Should handle a null type as non sensitive")
    void given_aNullType_should_notFlagItSensitive() {
      // -------- Act & Assert --------
      assertThat(SensitiveValueMaskingUtils.isSensitive((ContractOutputType) null)).isFalse();
      assertThat(SensitiveValueMaskingUtils.isSensitive((PrimitiveType) null)).isFalse();
      assertThat(SensitiveValueMaskingUtils.maskIfNeeded((ContractOutputType) null, "admin:admin"))
          .isEqualTo("admin:admin");
      assertThat(SensitiveValueMaskingUtils.maskIfNeeded((PrimitiveType) null, "admin:admin"))
          .isEqualTo("admin:admin");
    }
  }

  @Nested
  @DisplayName("When the type is not sensitive")
  class WhenNotSensitive {

    @Test
    @DisplayName("Should return the value untouched")
    void given_aNonSensitiveType_should_returnTheValueAsIs() {
      // -------- Act --------
      String masked =
          SensitiveValueMaskingUtils.maskIfNeeded(ContractOutputType.Text, "admin:Sup3rS3cret");

      // -------- Assert --------
      assertThat(masked).isEqualTo("admin:Sup3rS3cret");
      assertThat(SensitiveValueMaskingUtils.maskIfNeeded(PrimitiveType.Text, "plain"))
          .isEqualTo("plain");
    }
  }

  @Nested
  @DisplayName("When the type is sensitive")
  class WhenSensitive {

    @Test
    @DisplayName("Should mask each part of a credential value")
    void given_aCredentialShapedValue_should_maskEveryPart() {
      // -------- Act --------
      String masked =
          SensitiveValueMaskingUtils.maskIfNeeded(
              ContractOutputType.Credentials, "admin:motdepasse");

      // -------- Assert --------
      assertThat(masked).isEqualTo("ad" + MASK + ":mo" + MASK);
      assertThat(masked).doesNotContain("motdepasse");
    }

    @Test
    @DisplayName("Should mask every part of a value holding several separators")
    void given_aValueWithSeveralSeparators_should_maskEveryPart() {
      // -------- Act --------
      String masked =
          SensitiveValueMaskingUtils.maskIfNeeded(
              ContractOutputType.Credentials, "admin:aad3b435:31d6cfe0");

      // -------- Assert --------
      assertThat(masked).isEqualTo("ad" + MASK + ":aa" + MASK + ":31" + MASK);
    }

    @Test
    @DisplayName("Should keep a two character fragment of a value without separator")
    void given_aValueWithoutSeparator_should_keepAFragment() {
      // -------- Act --------
      String masked =
          SensitiveValueMaskingUtils.maskIfNeeded(PrimitiveType.Password, "Sup3rS3cret");

      // -------- Assert --------
      assertThat(masked).isEqualTo("Su" + MASK);
    }

    @Test
    @DisplayName("Should mask a short part entirely")
    void given_aShortPart_should_maskItEntirely() {
      // -------- Act & Assert --------
      assertThat(SensitiveValueMaskingUtils.maskIfNeeded(PrimitiveType.Hash, "abcd"))
          .isEqualTo(MASK);
      assertThat(
              SensitiveValueMaskingUtils.maskIfNeeded(
                  ContractOutputType.Credentials, "administrator:pwd"))
          .isEqualTo("ad" + MASK + ":" + MASK);
    }

    @Test
    @DisplayName("Should mask password, hash and key the same way")
    void given_eachSecretPrimitiveType_should_maskItTheSameWay() {
      // -------- Act & Assert --------
      assertThat(SensitiveValueMaskingUtils.maskIfNeeded(PrimitiveType.Password, "Secret13"))
          .isEqualTo("Se" + MASK);
      assertThat(SensitiveValueMaskingUtils.maskIfNeeded(PrimitiveType.Hash, "ABC123XYZ"))
          .isEqualTo("AB" + MASK);
      assertThat(SensitiveValueMaskingUtils.maskIfNeeded(PrimitiveType.Key, "KEY123456890"))
          .isEqualTo("KE" + MASK);
    }

    @Test
    @DisplayName("Should not leak the length of the secret")
    void given_twoSecretsOfDifferentLengths_should_produceTheSameMaskWidth() {
      // -------- Act --------
      String shortSecret = SensitiveValueMaskingUtils.maskIfNeeded(PrimitiveType.Key, "KEY12345");
      String longSecret =
          SensitiveValueMaskingUtils.maskIfNeeded(
              PrimitiveType.Key, "KEY123456789012345678901234567890");

      // -------- Assert --------
      assertThat(shortSecret).isEqualTo(longSecret).isEqualTo("KE" + MASK);
    }

    @Test
    @DisplayName("Should return blank and null values as is")
    void given_aBlankValue_should_returnItAsIs() {
      // -------- Act & Assert --------
      assertThat(SensitiveValueMaskingUtils.maskIfNeeded(ContractOutputType.Credentials, null))
          .isNull();
      assertThat(SensitiveValueMaskingUtils.maskIfNeeded(ContractOutputType.Credentials, "  "))
          .isEqualTo("  ");
    }
  }

  @Nested
  @DisplayName("When echoing a masked value back")
  class WhenEchoingAMaskedValue {

    @Test
    @DisplayName("Should recognize the mask of the value currently held")
    void given_theMaskOfTheCurrentValue_should_recognizeIt() {
      // -------- Act & Assert --------
      assertThat(
              SensitiveValueMaskingUtils.isMaskedRepresentationOfCurrentValue(
                  PrimitiveType.Password, "TopSecret", "To" + MASK))
          .isTrue();
    }

    @Test
    @DisplayName("Should not mistake a genuine new value for a masked echo")
    void given_aGenuineValue_should_notRecognizeItAsAnEcho() {
      // -------- Act & Assert --------
      assertThat(
              SensitiveValueMaskingUtils.isMaskedRepresentationOfCurrentValue(
                  PrimitiveType.Password, "TopSecret", "TopSecret"))
          .isFalse();
    }

    @Test
    @DisplayName("Should handle null arguments without recognizing an echo")
    void given_aNullArgument_should_notRecognizeAnEcho() {
      // -------- Act & Assert --------
      assertThat(
              SensitiveValueMaskingUtils.isMaskedRepresentationOfCurrentValue(
                  null, "TopSecret", "To" + MASK))
          .isFalse();
      assertThat(
              SensitiveValueMaskingUtils.isMaskedRepresentationOfCurrentValue(
                  PrimitiveType.Password, null, "To" + MASK))
          .isFalse();
      assertThat(
              SensitiveValueMaskingUtils.isMaskedRepresentationOfCurrentValue(
                  PrimitiveType.Password, "TopSecret", null))
          .isFalse();
    }
  }
}
