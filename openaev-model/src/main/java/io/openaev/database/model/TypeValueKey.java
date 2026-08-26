package io.openaev.database.model;

import java.util.Objects;

public class TypeValueKey {
  private final ContractOutputType type;
  private final String value;
  // Triforce Phase 1: a Finding's grouping identity is (type, value, location), not just (type,
  // value) - two Findings with the same type/value but different locationAsset are DIFFERENT
  // Findings (see FindingSpecification#distinctTypeValueWithFilter). Nullable: unlocated findings
  // (multi-asset checks, or types not yet covered by the Location backfill migration) still group
  // by (type, value) alone, same as before Phase 1.
  private final String locationAssetId;

  public TypeValueKey(ContractOutputType type, String value) {
    this(type, value, null);
  }

  public TypeValueKey(ContractOutputType type, String value, String locationAssetId) {
    this.type = type;
    this.value = value;
    this.locationAssetId = locationAssetId;
  }

  public ContractOutputType getType() {
    return type;
  }

  public String getValue() {
    return value;
  }

  public String getLocationAssetId() {
    return locationAssetId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof TypeValueKey)) return false;
    TypeValueKey that = (TypeValueKey) o;
    return type == that.type
        && Objects.equals(value, that.value)
        && Objects.equals(locationAssetId, that.locationAssetId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(type, value, locationAssetId);
  }
}
