package io.openbas.stix.types;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.stix.types.enums.HashingAlgorithms;
import java.util.Map;

public class Hashes extends BaseType<Map<HashingAlgorithms, java.lang.String>> {
  public Hashes(Map<HashingAlgorithms, java.lang.String> value) {
    super(value);
  }

  @Override
  public JsonNode toStix(ObjectMapper mapper) {
    return mapper.valueToTree(this.getValue());
  }
}
