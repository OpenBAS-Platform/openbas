package io.openbas.stix.types;

import lombok.Data;

import java.util.Map;

public class Dictionary extends BaseType<Map<java.lang.String, BaseType<?>>> {
  public Dictionary(Map<java.lang.String, BaseType<?>> value) {
    super(value);
  }
}
