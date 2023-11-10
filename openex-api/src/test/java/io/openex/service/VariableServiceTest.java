package io.openex.service;

import io.openex.database.model.Exercise;
import io.openex.database.model.Variable;
import io.openex.database.model.Variable.VariableType;
import io.openex.database.repository.ExerciseRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class VariableServiceTest {

  @Autowired
  private VariableService variableService;

  @Autowired
  private ExerciseRepository exerciseRepository;

  static String EXERCISE_ID;
  static String VARIABLE_ID;

  @DisplayName("Create variable")
  @Test
  @Order(1)
  void createVariableTest() {
    // -- PREPARE --
    Exercise exercise = new Exercise();
    Exercise exerciseCreated = this.exerciseRepository.save(exercise);
    EXERCISE_ID = exerciseCreated.getId();
    Variable variable = new Variable();
    String variableKey = "key";
    variable.setKey(variableKey);
    variable.setValue(" a value ");

    // -- EXECUTE --
    Variable variableCreated = this.variableService.createVariable(exerciseCreated.getId(), variable);
    VARIABLE_ID = variableCreated.getId();
    assertNotNull(variableCreated);
    assertNotNull(variableCreated.getId());
    assertNotNull(variableCreated.getCreatedAt());
    assertNotNull(variableCreated.getUpdatedAt());
    assertEquals(variableKey, variableCreated.getKey());
    assertEquals(VariableType.String, variableCreated.getType());
  }

  @DisplayName("Retrieve variable")
  @Test
  @Order(2)
  void retrieveVariableTest() {
    Variable variable = this.variableService.variable(VARIABLE_ID);
    assertNotNull(variable);

    List<Variable> variables = this.variableService.variables(EXERCISE_ID);
    assertNotNull(variable);
    assertEquals(VARIABLE_ID, variables.get(0).getId());
  }

  @DisplayName("Update variable")
  @Test
  @Order(3)
  void updateVariableTest() {
    // -- PREPARE --
    Variable variable = this.variableService.variable(VARIABLE_ID);
    String variableName = "key_updated";
    variable.setKey(variableName);

    // -- EXECUTE --
    Variable variableUpdated = this.variableService.updateVariable(variable);
    assertNotNull(variable);
    assertEquals(variableName, variableUpdated.getKey());
  }

  @DisplayName("Delete variable")
  @Test
  @Order(4)
  void deleteVariableTest() {
    this.variableService.deleteVariable(VARIABLE_ID);
    try {
      this.variableService.variable(VARIABLE_ID);
    } catch (Exception e) {
      assertEquals(NoSuchElementException.class, e.getClass());
    }
  }

}
