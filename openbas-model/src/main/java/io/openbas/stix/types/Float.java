package io.openbas.stix.types;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class Float extends BaseType<java.lang.Float> {
  public Float(java.lang.Float value) {
    super(value);
  }

  @Override
  public JsonNode toStix(ObjectMapper mapper) {
    return mapper.valueToTree(this.getValue());
  }
}
