package io.openbas.stix.objects;

import io.openbas.stix.types.BaseType;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

public class ObjectBase {
  @Getter @Setter private Map<String, BaseType<?>> properties;
}
