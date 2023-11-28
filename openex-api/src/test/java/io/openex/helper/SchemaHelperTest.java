package io.openex.helper;

import io.openex.database.model.Audience;
import io.openex.database.model.User;
import io.openex.model.PropertySchema;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class SchemaHelperTest {

  // -- USER --

  @DisplayName("Test retrieve json schema for player")
  @Test
  void playerJsonSchema() {
    List<PropertySchema> jsonSchema = SchemaHelper.schema(User.class);
    assertNotNull(jsonSchema);
    assertEquals(31, jsonSchema.size());
    assertEquals(3, jsonSchema.stream().filter(PropertySchema::isMandatory).count()); // Required
    assertEquals(19, jsonSchema.stream().filter((p) -> String.class.equals(p.getType())).count()); // Type
    assertEquals(7, jsonSchema.stream().filter(PropertySchema::isMultiple).count()); // Cardinality
  }

  // -- AUDIENCE --

  @DisplayName("Test retrieve json schema for audience")
  @Test
  void audienceJsonSchema() {
    List<PropertySchema> jsonSchema = SchemaHelper.schema(Audience.class);
    assertNotNull(jsonSchema);
    assertEquals(10, jsonSchema.size());
    assertEquals(0, jsonSchema.stream().filter(PropertySchema::isMandatory).count()); // Required
    assertEquals(3, jsonSchema.stream().filter((p) -> String.class.equals(p.getType())).count()); // Type
    assertEquals(3, jsonSchema.stream().filter(PropertySchema::isMultiple).count()); // Cardinality
  }

}
