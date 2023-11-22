package io.openex.service;

import io.openex.database.model.User;
import io.openex.database.repository.UserRepository;
import io.openex.model.*;
import io.openex.rest.user.form.player.CreatePlayerInput;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.stream.StreamSupport;

import static io.openex.model.CsvMapper.SEPARATOR.COMMA;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class MappingServiceTest {

  @Autowired
  private MappingService mappingService;

  @Autowired
  private UserRepository userRepository;

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

    List<? extends RepositoryClass> results = this.mappingService.mapCsvFile("mapper/Players.csv", csvMapper);
    this.mappingService.savingProcess(results);

    assertNotNull(results);

    Iterable<User> userIterable = this.userRepository.findAll();
    List<User> users = StreamSupport
        .stream(userIterable.spliterator(), false)
        .toList();
    assertEquals(results.size() + 1, users.size());

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
