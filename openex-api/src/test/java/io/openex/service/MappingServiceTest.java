package io.openex.service;

import io.openex.database.model.*;
import io.openex.database.repository.AudienceRepository;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.StreamSupport;

import static io.openex.helper.DataMapperDefinitionHelper.dataMapperAudienceDefinition;
import static io.openex.helper.DataMapperDefinitionHelper.dataMapperPlayerDefinition;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class MappingServiceTest<T extends Base> {

  @Autowired
  private MappingService mappingService;

  @Autowired
  private AudienceRepository audienceRepository;
  @Autowired
  private ExerciseRepository exerciseRepository;
  @Autowired
  private UserRepository userRepository;

  // -- PLAYER --

  @DisplayName("Test use data mapper for player")
  @Test
  void playerDataMapper() {
    // -- PREPARE --
    DataMapper dataMapper = dataMapperPlayerDefinition();
    List<DataMapperRepresentationProperty> properties = dataMapper.getRepresentations().get(0).getProperties();
    for (DataMapperRepresentationProperty property : properties) {
      switch (property.getPropertyName()) {
        case "email" -> property.setColumnName("A");
        case "firstname" -> property.setColumnName("B");
        case "lastname" -> property.setColumnName("C");
      }
    }

    // -- EXECUTE --
    this.mappingService.mapCsvFile(null, "mapper/Players.csv", dataMapper);

    // -- ASSERT --
    Iterable<User> userIterable = this.userRepository.findAll();
    List<User> users = StreamSupport
        .stream(userIterable.spliterator(), false)
        .filter((u) -> u.getEmail().contains("playertest"))
        .toList();
    assertEquals(8, users.size());
  }

  // -- AUDIENCE --

  @DisplayName("Test use data mapper for audience")
  @Test
  @Transactional
  void audienceDataMapper() {
    // -- PREPARE --
    Exercise exercise = new Exercise();
    exercise.setName("Exercice name");
    Exercise exerciseCreated = this.exerciseRepository.save(exercise);
    DataMapper dataMapper = dataMapperAudienceDefinition();
    // Audience
    List<DataMapperRepresentationProperty> audienceProperties = dataMapper.getRepresentations().get(0).getProperties();
    for (DataMapperRepresentationProperty property : audienceProperties) {
      switch (property.getPropertyName()) {
        case "name" -> property.setColumnName("A");
        case "description" -> property.setColumnName("B");
      }
    }
    // PLayer
    List<DataMapperRepresentationProperty> playerProperties = dataMapper.getRepresentations().get(1).getProperties();
    for (DataMapperRepresentationProperty property : playerProperties) {
      if (property.getPropertyName().equals("email")) {
        property.setColumnName("C");
      }
    }

    // -- EXECUTE --
    this.mappingService.mapCsvFile(exerciseCreated.getId(), "mapper/Audience.csv", dataMapper);

    // -- ASSERT --
    Iterable<Audience> audienceIterable = this.audienceRepository.findAll();
    List<Audience> audiences = StreamSupport
        .stream(audienceIterable.spliterator(), false)
        .filter((a) -> a.getName().contains("Player"))
        .toList();
    assertEquals(3, audiences.size());
    Audience playerTeamAudience = audiences.stream().filter((a) -> "Player team".equals(a.getName())).findFirst()
        .orElseThrow();
    assertEquals(6, playerTeamAudience.getUsers().size());

    Iterable<User> userIterable = this.userRepository.findAll();
    List<User> users = StreamSupport
        .stream(userIterable.spliterator(), false)
        .filter((u) -> u.getEmail().contains("playertest"))
        .toList();
    assertEquals(8, users.size());
  }

}
