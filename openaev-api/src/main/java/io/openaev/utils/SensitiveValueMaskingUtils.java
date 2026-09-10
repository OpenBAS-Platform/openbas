package io.openaev.utils;

import io.openaev.database.model.ChainingTypeRegistry;
import io.openaev.database.model.ContractOutputType;
import io.openaev.database.model.PrimitiveType;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Single source of truth for masking the secret material the platform discovers during simulations.
 *
 * <p>Sensitivity is <b>derived</b>, never stored: a value is secret because of the type it was
 * extracted as. {@link ChainingTypeRegistry} already decomposes every {@link ContractOutputType}
 * into the {@link PrimitiveType}s it is made of, so a type holding a {@code password}, a {@code
 * hash} or a {@code key} is sensitive by construction. Adding a new contract output type carrying a
 * hash makes it masked automatically, with no column, no migration and no flag to thread through
 * the output processors.
 *
 * <p>Note on location: this class currently lives in {@code openaev-api}, which covers every place
 * the platform hands a value out today (finding serialization, chaining engine, attack path). If
 * masking at indexing time ever becomes necessary - so that reports and dashboards are covered too
 * - this class will have to move back down to {@code openaev-model}, because {@code FindingHandler}
 * lives there and cannot depend on {@code openaev-api}.
 *
 * <p>The database always keeps the cleartext value: deduplication, correlation and attack path
 * computation rely on it. Only the representation handed out is masked.
 */
public final class SensitiveValueMaskingUtils {

  /** Mask substituted to the secret part of a sensitive value. */
  public static final String MASK = "******";

  private static final char PART_SEPARATOR = ':';
  private static final int MASKING_VISIBLE_FRAGMENT_LENGTH = 2;
  private static final int MASKING_MIN_LENGTH_FOR_FRAGMENT = 5;

  /**
   * Primitive types whose values are secret material: they must never leave the platform in
   * cleartext, so any value carrying one of them is masked.
   */
  private static final Set<PrimitiveType> TYPE_TO_MASK =
      Set.of(PrimitiveType.Password, PrimitiveType.Hash, PrimitiveType.Key);

  /**
   * Contract output types explicitly excluded from the derivation, whatever their recipe says. The
   * recipe describes the fields of the <em>contract</em>, not the composition of the finding value,
   * so it yields two distinct kinds of false positive.
   *
   * <p><b>False positive of vocabulary.</b> {@link ContractOutputType#PasswordPolicy} decomposes
   * into {@link PrimitiveType#Key} - but that {@code key} is the <em>name of a password policy
   * setting</em> (for instance {@code MinimumPasswordLength}), not a cryptographic key. Masking it
   * would hide the very information the finding exists to report.
   *
   * <p><b>False positive of composition.</b> {@link ContractOutputType#AsreproastableAccount} and
   * {@link ContractOutputType#KerberoastableAccount} declare a {@code hash} field, but their
   * processors build the finding value from the username alone ({@code toFindingValue} returns
   * {@code buildString(jsonNode, USERNAME)}): the hash never reaches the value, so there is nothing
   * to protect and masking would only hide an account name.
   *
   * <p>Both exclusions are explicit Product decisions (issue 7500). This set must be revisited if
   * {@code toFindingValue} of either account processor ever starts including the hash: the value
   * would then carry crackable material and the exclusion would become a leak.
   */
  private static final Set<ContractOutputType> NEVER_SENSITIVE =
      Set.of(
          ContractOutputType.PasswordPolicy,
          ContractOutputType.AsreproastableAccount,
          ContractOutputType.KerberoastableAccount);

  private SensitiveValueMaskingUtils() {}

  /**
   * Whether findings of this contract output type hold secret material, hence must be masked when
   * the platform hands their value out.
   *
   * @param type the contract output type the value was extracted as
   * @return true when at least one primitive type of its recipe is secret material
   */
  public static boolean isSensitive(final ContractOutputType type) {
    if (type == null || NEVER_SENSITIVE.contains(type)) {
      return false;
    }
    return primitiveTypesOf(type).stream().anyMatch(TYPE_TO_MASK::contains);
  }

  /**
   * Every contract output type is registered in the chaining registry, but an unregistered one
   * would make it throw. Such a type carries no known primitive, hence no known secret: treat it as
   * non sensitive rather than failing the whole serialization of a finding page.
   */
  private static List<PrimitiveType> primitiveTypesOf(final ContractOutputType type) {
    try {
      return ChainingTypeRegistry.getPrimitiveTypesForContractOutputType(type);
    } catch (IllegalArgumentException e) {
      return List.of();
    }
  }

  /** Whether values of this primitive type are secret material. */
  public static boolean isSensitive(final PrimitiveType type) {
    return type != null && TYPE_TO_MASK.contains(type);
  }

  /**
   * Masks the value when the primitive type holds secret material, returns it untouched otherwise.
   *
   * @param type the primitive type of the value
   * @param value the cleartext value
   * @return the masked value, or the value as-is when the type is not sensitive
   */
  public static String maskIfNeeded(final PrimitiveType type, final String value) {
    return isSensitive(type) ? mask(value) : value;
  }

  /**
   * Whether the candidate value is nothing but the masked representation of the value currently
   * held.
   *
   * <p>A masked value is handed out by the API, so a client editing anything else of the same
   * object sends it back unchanged. Persisting it would overwrite the secret with its own mask:
   * this is the guard that detects the echo so the raw value can be kept instead.
   *
   * @param type the primitive type of the value
   * @param rawValue the cleartext value currently held
   * @param candidateValue the value received from the client
   * @return true when the candidate is exactly what masking the raw value produces
   */
  public static boolean isMaskedRepresentationOfCurrentValue(
      final PrimitiveType type, final String rawValue, final String candidateValue) {
    if (type == null || rawValue == null || candidateValue == null) {
      return false;
    }
    return maskIfNeeded(type, rawValue).equals(candidateValue);
  }

  /**
   * Masks the value when the contract output type holds secret material, returns it untouched
   * otherwise.
   *
   * @param type the contract output type of the value
   * @param value the cleartext value
   * @return the masked value, or the value as-is when the type is not sensitive
   */
  public static String maskIfNeeded(final ContractOutputType type, final String value) {
    return isSensitive(type) ? mask(value) : value;
  }

  /**
   * Masks a value whatever its type.
   *
   * <p>Every part of the value - the parts being separated by {@code :} - is masked the same way: a
   * two character fragment is kept so an operator can still tell WHICH secret was discovered when
   * the value is already known to them, without ever disclosing it. A part too short to keep a
   * fragment without disclosing most of it is masked entirely. The mask has a fixed width so the
   * length of the secret is not leaked either.
   *
   * <ul>
   *   <li>{@code admin:motdepasse} becomes {@code ad******:mo******}
   *   <li>{@code Sup3rS3cret} becomes {@code Su******}
   *   <li>{@code abcd} becomes {@code ******}
   * </ul>
   *
   * @param value the cleartext value
   * @return its masked form, or the value as-is when it is null or blank
   */
  public static String mask(final String value) {
    if (value == null || value.isBlank()) {
      return value;
    }

    return Arrays.stream(value.split(String.valueOf(PART_SEPARATOR), -1))
        .map(SensitiveValueMaskingUtils::maskPart)
        .collect(Collectors.joining(String.valueOf(PART_SEPARATOR)));
  }

  private static String maskPart(final String part) {
    if (part.length() < MASKING_MIN_LENGTH_FOR_FRAGMENT) {
      return MASK;
    }
    return part.substring(0, MASKING_VISIBLE_FRAGMENT_LENGTH) + MASK;
  }
}
