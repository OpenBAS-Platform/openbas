package io.openex.rest.mapping;

import io.openex.model.PropertyJsonSchema;
import io.openex.rest.user.form.player.CreatePlayerInput;
import io.openex.service.MappingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MappingApi {

  private final MappingService mappingService;

  @GetMapping("/api/mappings/player")
  public List<PropertyJsonSchema> player() {
    return this.mappingService.jsonSchema(CreatePlayerInput.class);
  }

}
