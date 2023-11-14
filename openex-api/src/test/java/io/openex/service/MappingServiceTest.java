package io.openex.service;

import io.openex.model.PropertyJsonSchema;
import io.openex.rest.user.form.player.CreatePlayerInput;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class MappingServiceTest {

  @Autowired
  private MappingService mappingService;

  @DisplayName("Test json schema for player")
  @Test
  void playerJsonSchema() {
    List<PropertyJsonSchema> jsonSchema = this.mappingService.jsonSchema(CreatePlayerInput.class);
    assertNotNull(jsonSchema);
    assertEquals(6, jsonSchema.size());
    assertEquals(1, jsonSchema.stream().filter(PropertyJsonSchema::isMandatory).count()); // Required
    assertEquals(5, jsonSchema.stream().filter((p) -> String.class.equals(p.getType())).count()); // Type
    assertEquals(1, jsonSchema.stream().filter(PropertyJsonSchema::isMultiple).count()); // Cardinality
  }

}
