package io.openbas.stix.objects;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.stix.parsing.StixSerialisable;
import io.openbas.stix.types.BaseType;
import java.util.Map;

public abstract class ObjectBase implements StixSerialisable {
  private final Map<String, BaseType<?>> properties;

  protected ObjectBase(Map<String, BaseType<?>> properties) {
    this.properties = properties;
  }

  public BaseType<?> getProperty(String name) {
    return properties.get(name);
  }

  public void setProperty(String name, BaseType<?> value) {
    properties.put(name, value);
  }

  public boolean hasProperty(String name) {
    return properties.containsKey(name);
  }

  @Override
  public JsonNode toStix(ObjectMapper mapper) {
    ObjectNode node = mapper.createObjectNode();
    for (Map.Entry<String, BaseType<?>> entry : properties.entrySet()) {
      node.set(entry.getKey(), entry.getValue().toStix(mapper));
    }
    return node;
  }
}
