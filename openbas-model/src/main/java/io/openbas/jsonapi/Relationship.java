package io.openbas.jsonapi;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record Relationship(@NotNull Object data) {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  @SuppressWarnings("unchecked")
  public List<ResourceIdentifier> asMany() {
    if (data instanceof List<?> list) {
      return list.stream()
          .map(item -> MAPPER.convertValue(item, ResourceIdentifier.class))
          .toList();
    }
    return List.of();
  }

  public ResourceIdentifier asOne() {
    if (data instanceof ResourceIdentifier resourceIdentifier) {
      return resourceIdentifier;
    }
    if (data instanceof java.util.Map<?, ?> map) {
      return MAPPER.convertValue(map, ResourceIdentifier.class);
    }
    return null;
  }
}
