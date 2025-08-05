package io.openbas.stix.objects;

import io.openbas.stix.types.Identifier;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

public class Bundle {
  private static final String TYPE = "bundle";

  public Bundle(Identifier id, List<ObjectBase> objects) {
    this.id = id;
    this.objects = objects;
  }

  public ObjectBase findById(String id) {
    return this.objects.stream().filter(ob -> ((String) ob.getProperties().get("id").getValue()).equals(id)).findFirst().orElseThrow();
  }

  @Getter
  private final Identifier id;
  @Getter
  private final String type = TYPE;
  @Getter
  private final List<ObjectBase> objects;
}
