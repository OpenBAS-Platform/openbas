package io.openbas.service;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Variable;
import io.openbas.database.model.Variable.VariableType;
import io.openbas.database.repository.ExerciseRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.*;

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
    exercise.setName("Exercice name");
    exercise.setReplyTo("test@test.com");
    Exercise exerciseCreated = this.exerciseRepository.save(exercise);
    EXERCISE_ID = exerciseCreated.getId();
    Variable variable = new Variable();
    String variableKey = "key";
    variable.setKey(variableKey);
    variable.setExercise(exerciseCreated);

    // -- EXECUTE --
    Variable variableCreated = this.variableService.createVariable(variable);
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

    List<Variable> variables = this.variableService.variablesFromExercise(EXERCISE_ID);
    assertNotNull(variable);
    assertEquals(VARIABLE_ID, variables.get(0).getId());
  }

  @DisplayName("Update variable")
  @Test
  @Order(3)
  void updateVariableTest() {
    // -- PREPARE --
    Variable variable = this.variableService.variable(VARIABLE_ID);
    String value = "A value";
    variable.setValue(value);

    // -- EXECUTE --
    Variable variableUpdated = this.variableService.updateVariable(variable);
    assertNotNull(variable);
    assertEquals(value, variableUpdated.getValue());
  }

  @DisplayName("Delete variable")
  @Test
  @Order(4)
  void deleteVariableTest() {
    this.variableService.deleteVariable(VARIABLE_ID);
    assertThrows(NoSuchElementException.class, () -> this.variableService.variable(VARIABLE_ID));
  }

}
