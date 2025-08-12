package io.openbas.stix.types;

import java.util.Objects;

import io.openbas.stix.parsing.StixSerialisable;
import lombok.Getter;

@Getter
public abstract class BaseType<T> implements StixSerialisable {
  private final T value;

  public BaseType(T value) {
    this.value = value;
  }

  @Override
  public boolean equals(Object o) {
    if (o == null || getClass() != o.getClass()) return false;
    BaseType<?> baseType = (BaseType<?>) o;
    return Objects.equals(value, baseType.value);
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(value);
  }
}
