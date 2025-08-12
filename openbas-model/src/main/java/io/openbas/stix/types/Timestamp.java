package io.openbas.stix.types;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Instant;

public class Timestamp extends BaseType<Instant> {
  public Timestamp(Instant value) {
    super(value);
  }

  @Override
  public JsonNode toStix(ObjectMapper mapper) {
    return mapper.valueToTree(this.getValue());
  }
}
