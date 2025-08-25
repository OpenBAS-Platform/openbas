package io.openbas.stix.objects;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.stix.parsing.ParsingException;
import io.openbas.stix.parsing.StixSerialisable;
import io.openbas.stix.types.BaseType;
import java.time.Instant;
import java.util.Map;
import java.util.function.Consumer;

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

  public String getRequiredProperty(String propName) throws ParsingException {
    if (!this.hasProperty(propName) || this.getProperty(propName).getValue() == null) {
      throw new ParsingException("Missing required property: " + propName);
    }
    return this.getProperty(propName).getValue().toString();
  }

  public String getOptionalProperty(String propName, String defaultValue) {
    if (this.hasProperty(propName) && this.getProperty(propName).getValue() != null) {
      return this.getProperty(propName).getValue().toString();
    }
    return defaultValue;
  }

  public void setIfPresent(String propName, Consumer<String> setter) {
    if (this.hasProperty(propName) && this.getProperty(propName).getValue() != null) {
      setter.accept(this.getProperty(propName).getValue().toString());
    }
  }

  public void setInstantIfPresent(String propName, Consumer<Instant> setter) {
    if (this.hasProperty(propName) && this.getProperty(propName).getValue() != null) {
      setter.accept(Instant.parse(this.getProperty(propName).getValue().toString()));
    }
  }
}
