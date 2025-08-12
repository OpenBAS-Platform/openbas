package io.openbas.stix.objects;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.stix.parsing.StixSerialisable;
import io.openbas.stix.types.Identifier;
import java.util.List;
import lombok.Getter;

public class Bundle implements StixSerialisable {
  private static final String TYPE = "bundle";

  public Bundle(Identifier id, List<ObjectBase> objects) {
    this.id = id;
    this.objects = objects;
  }

  public ObjectBase findById(String id) {
    return this.objects.stream()
        .filter(ob -> ob.getProperties().get("id").getValue().equals(id))
        .findFirst()
        .orElseThrow();
  }

  @Getter private final Identifier id;
  @Getter private final String type = TYPE;
  @Getter private final List<ObjectBase> objects;

  @Override
  public JsonNode toStix(ObjectMapper mapper) {
    ObjectNode node = mapper.createObjectNode();
    node.set("id", getId().toStix(mapper));
    node.set("type", mapper.valueToTree(getType()));
    node.set(
        "objects", mapper.valueToTree(getObjects().stream().map(ob -> ob.toStix(mapper)).toList()));
    return node;
  }
}
