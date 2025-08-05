package io.openbas.stix.types;

import io.openbas.stix.types.enums.HashingAlgorithms;
import java.util.Map;

public class Hashes extends BaseType<Map<HashingAlgorithms, java.lang.String>> {
  public Hashes(Map<HashingAlgorithms, java.lang.String> value) {
    super(value);
  }
}
