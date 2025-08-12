package io.openbas.stix.objects;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.stix.parsing.StixSerialisable;
import io.openbas.stix.types.BaseType;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

public class ObjectBase implements StixSerialisable {
  @Getter @Setter private Map<String, BaseType<?>> properties;

  @Override
  public JsonNode toStix(ObjectMapper mapper) {
    ObjectNode node = mapper.createObjectNode();
    for (Map.Entry<String, BaseType<?>> entry : properties.entrySet()) {
      node.set(entry.getKey(), entry.getValue().toStix(mapper));
    }
    return node;
  }
}
