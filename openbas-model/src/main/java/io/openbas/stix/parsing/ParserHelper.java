package io.openbas.stix.parsing;

import io.openbas.stix.objects.ObjectBase;
import java.time.Instant;
import java.util.function.Consumer;
import org.springframework.stereotype.Component;

@Component
public class ParserHelper {

  public String getRequiredProperty(ObjectBase obj, String propName) throws ParsingException {
    if (!obj.hasProperty(propName) || obj.getProperty(propName).getValue() == null) {
      throw new ParsingException("Missing required property: " + propName);
    }
    return obj.getProperty(propName).getValue().toString();
  }

  public String getOptionalProperty(ObjectBase obj, String propName, String defaultValue) {
    if (obj.hasProperty(propName) && obj.getProperty(propName).getValue() != null) {
      return obj.getProperty(propName).getValue().toString();
    }
    return defaultValue;
  }

  public void setIfPresent(ObjectBase obj, String propName, Consumer<String> setter) {
    if (obj.hasProperty(propName) && obj.getProperty(propName).getValue() != null) {
      setter.accept(obj.getProperty(propName).getValue().toString());
    }
  }

  public void setInstantIfPresent(ObjectBase obj, String propName, Consumer<Instant> setter) {
    if (obj.hasProperty(propName) && obj.getProperty(propName).getValue() != null) {
      setter.accept(Instant.parse(obj.getProperty(propName).getValue().toString()));
    }
  }
}
