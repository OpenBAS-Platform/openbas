package io.openex.service;

import io.openex.database.model.DataMapper;
import io.openex.database.model.DataMapper.TYPE;
import io.openex.database.model.DataMapperRepresentation;
import io.openex.database.model.DataMapperRepresentationProperty;
import io.openex.database.repository.DataMapperRepresentationPropertyRepository;
import io.openex.database.repository.DataMapperRepresentationRepository;
import io.openex.rest.user.form.player.CreatePlayerInput;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.NoSuchElementException;

import static io.openex.database.model.DataMapper.SEPARATOR.COMMA;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class DataMapperServiceTest {

  @Autowired
  private DataMapperService dataMapperService;

  @Autowired
  private DataMapperRepresentationRepository dataMapperRepresentationRepository;

  @Autowired
  private DataMapperRepresentationPropertyRepository dataMapperRepresentationPropertyRepository;

  static String DATA_MAPPER_ID;

  @DisplayName("Create data mapper")
  @Test
  @Order(1)
  void createDataMapperTest() {
    // -- PREPARE --
    DataMapper dataMapper = buildDataMapper();

    // -- EXECUTE --
    DataMapper dataMapperCreated = this.dataMapperService.createDataMapper(dataMapper);
    DATA_MAPPER_ID = dataMapperCreated.getId();
    assertNotNull(dataMapperCreated);
    assertNotNull(dataMapperCreated.getId());
    assertTrue(dataMapperCreated.isHasHeader());
    assertEquals(COMMA, dataMapperCreated.getSeparator());
    assertNotNull(dataMapperCreated.getCreatedAt());
    assertNotNull(dataMapperCreated.getUpdatedAt());

    List<DataMapperRepresentation> dataMapperRepresentations = dataMapperCreated.getRepresentations();
    assertEquals(1, dataMapperRepresentations.size());
    DataMapperRepresentation dataMapperRepresentation = dataMapperRepresentations.get(0);
    DataMapperRepresentation dataMapperRepresentationDB = this.dataMapperRepresentationRepository.findAll().iterator()
        .next();
    assertNotNull(dataMapperRepresentationDB);
    assertNotNull(dataMapperRepresentation);
    assertEquals(dataMapperRepresentationDB.getId(), dataMapperRepresentation.getId());
    assertEquals(CreatePlayerInput.class, dataMapperRepresentation.getClazz());
    assertNotNull(dataMapperRepresentation.getCreatedAt());
    assertNotNull(dataMapperRepresentation.getUpdatedAt());

    List<DataMapperRepresentationProperty> dataMapperRepresentationProperties = dataMapperRepresentation.getProperties();
    assertEquals(3, dataMapperRepresentationProperties.size());
    DataMapperRepresentationProperty dataMapperRepresentationProperty = dataMapperRepresentationProperties.get(0);
    DataMapperRepresentationProperty dataMapperRepresentationPropertyDB = this.dataMapperRepresentationPropertyRepository.findAll()
        .iterator().next();
    assertNotNull(dataMapperRepresentationProperty);
    assertNotNull(dataMapperRepresentationPropertyDB);
    assertEquals(dataMapperRepresentationPropertyDB.getId(), dataMapperRepresentationProperty.getId());
    assertEquals("user_email", dataMapperRepresentationProperty.getPropertyName());
    assertEquals("A", dataMapperRepresentationProperty.getColumnName());
    assertNotNull(dataMapperRepresentationProperty.getCreatedAt());
    assertNotNull(dataMapperRepresentationProperty.getUpdatedAt());
  }

  @DisplayName("Retrieve data mapper")
  @Test
  @Order(2)
  void retrieveDataMapperTest() {
    DataMapper dataMapper = this.dataMapperService.dataMapper(DATA_MAPPER_ID);
    assertNotNull(dataMapper);
    assertNotNull(dataMapper.getRepresentations().get(0));
    assertNotNull(dataMapper.getRepresentations().get(0).getProperties().get(0));

    Iterable<DataMapper> dataMappers = this.dataMapperService.dataMappers();
    assertNotNull(dataMappers);
    assertEquals(DATA_MAPPER_ID, dataMappers.iterator().next().getId());

    dataMappers = this.dataMapperService.dataMappers(TYPE.PLAYER.name());
    assertNotNull(dataMappers);
    assertEquals(DATA_MAPPER_ID, dataMappers.iterator().next().getId());
  }

  @DisplayName("Update data mapper")
  @Test
  @Order(3)
  void updateDataMapperTest() {
    // -- PREPARE --
    DataMapper dataMapper = this.dataMapperService.dataMapper(DATA_MAPPER_ID);
    String columnName = "G";
    dataMapper.getRepresentations().get(0).getProperties().get(0).setColumnName(columnName);

    // -- EXECUTE --
    DataMapper dataMapperUpdated = this.dataMapperService.updateDataMapper(dataMapper);
    assertNotNull(dataMapperUpdated);
    assertEquals(columnName, dataMapper.getRepresentations().get(0).getProperties().get(0).getColumnName());
  }

  @DisplayName("Delete data mapper")
  @Test
  @Order(4)
  void deleteDataMapperTest() {
    this.dataMapperService.deleteDataMapper(DATA_MAPPER_ID);
    assertThrows(NoSuchElementException.class, () -> this.dataMapperService.dataMapper(DATA_MAPPER_ID));
  }

  // -- PRIVATE --

  private DataMapper buildDataMapper() {
    DataMapper dataMapper = this.dataMapperService.dataMapperDefinition(TYPE.PLAYER.name()).get(0);
    List<DataMapperRepresentationProperty> properties = dataMapper.getRepresentations().get(0).getProperties();
    for (DataMapperRepresentationProperty property : properties) {
      switch (property.getPropertyName()) {
        case "user_email" -> property.setColumnName("A");
        case "user_firstname" -> property.setColumnName("B");
        case "user_lastname" -> property.setColumnName("C");
      }
    }
    return dataMapper;
  }

}
