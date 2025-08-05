package io.openbas.stix.objects;

import io.openbas.stix.types.BaseType;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

public class ObjectBase {
  @Getter
  @Setter
  private Map<String, BaseType<?>> properties;
}
