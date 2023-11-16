package io.openex.service;

import io.openex.model.CsvMapper;
import io.openex.model.CsvMapperRepresentation;
import io.openex.model.CsvMapperRepresentationProperty;
import io.openex.model.PropertySchema;
import io.openex.rest.user.form.player.CreatePlayerInput;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.repository.CrudRepository;
import reactor.util.function.Tuple2;

import java.util.List;

import static io.openex.model.CsvMapper.SEPARATOR.COMMA;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class MappingServiceTest {

  @Autowired
  private MappingService mappingService;

  @DisplayName("Test get json schema for player")
  @Test
  void getPlayerJsonSchema() {
    List<PropertySchema> jsonSchema = this.mappingService.schema(CreatePlayerInput.class);
    assertNotNull(jsonSchema);
    assertEquals(6, jsonSchema.size());
    assertEquals(1, jsonSchema.stream().filter(PropertySchema::isMandatory).count()); // Required
    assertEquals(5, jsonSchema.stream().filter((p) -> String.class.equals(p.getType())).count()); // Type
    assertEquals(1, jsonSchema.stream().filter(PropertySchema::isMultiple).count()); // Cardinality
  }

  @DisplayName("Test use json schema for player")
  @Test
  void usePlayerJsonSchema() {
    CsvMapper csvMapper = buildCsvMapperForPlayer();

    List<Tuple2<?, CrudRepository<?, ?>>> results = this.mappingService.mapCsvFile("mapper/Players.csv", csvMapper);

    assertNotNull(results);

    results.forEach((r) -> {
      Object object = r.getT1();
      CrudRepository<?, ?> repository = r.getT2();
//      repository.save(object);
    });

  }

  private CsvMapper buildCsvMapperForPlayer() {
    CsvMapperRepresentationProperty emailProperty = new CsvMapperRepresentationProperty("user_email", "A");
    CsvMapperRepresentationProperty firstnameProperty = new CsvMapperRepresentationProperty("user_firstname", "B");
    CsvMapperRepresentationProperty lastnameProperty = new CsvMapperRepresentationProperty("user_lastname", "C");

    CsvMapperRepresentation csvMapperRepresentation = CsvMapperRepresentation.builder()
        .id("players-representation")
        .clazz(CreatePlayerInput.class)
        .property(emailProperty)
        .property(firstnameProperty)
        .property(lastnameProperty)
        .build();

    CsvMapper.CsvMapperBuilder csvMapperBuilder = CsvMapper.builder()
        .name("My player mapper")
        .hasHeader(true)
        .separator(COMMA)
        .representation(csvMapperRepresentation);

    return csvMapperBuilder.build();
  }

}
