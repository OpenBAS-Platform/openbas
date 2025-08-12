package io.openbas.stix.types;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class Hex extends BaseType<java.lang.String> {
  public Hex(java.lang.String value) {
    super(value);
  }

  @Override
  public JsonNode toStix(ObjectMapper mapper) {
    return mapper.valueToTree(this.getValue());
  }
}
