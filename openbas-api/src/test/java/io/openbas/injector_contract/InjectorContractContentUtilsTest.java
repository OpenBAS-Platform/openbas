package io.openbas.injector_contract;

import static io.openbas.rest.injector_contract.InjectorContractContentUtils.getDynamicInjectorContractFieldsForInject;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.InjectorContract;
import io.openbas.utils.fixtures.InjectorContractFixture;
import org.junit.jupiter.api.Test;

public class InjectorContractContentUtilsTest {

  private static final ObjectMapper mapper = new ObjectMapper();

  @Test
  public void shouldAddExpectationsWhenPredefinedExpectationsExistent() {
    ArrayNode predefinedExpectations = mapper.createArrayNode();
    predefinedExpectations.add(createExpectation("Prevention"));

    ObjectNode content = createContentWithField("expectations", "n", predefinedExpectations);

    InjectorContract contract = InjectorContractFixture.createInjectorContract(content);
    ObjectNode result = getDynamicInjectorContractFieldsForInject(contract);

    assertNotNull(result);
    assertTrue(result.has("expectations"));
    assertEquals("Prevention", result.get("expectations").get(0).get("expectation_name").asText());
    assertEquals(1, result.get("expectations"));
  }

  @Test
  public void shouldNotAddExpectationsWhenPredefinedExpectationsAreEmpty() {
    ArrayNode emptyExpectations = mapper.createArrayNode(); // empty array

    ObjectNode content = createContentWithField("expectations", "n", emptyExpectations);

    InjectorContract contract = InjectorContractFixture.createInjectorContract(content);
    ObjectNode result = getDynamicInjectorContractFieldsForInject(contract);

    assertNotNull(result);
    assertFalse(result.has("expectations"));
  }

  @Test
  public void shouldNotAddExpectationsWhenExpectationKeyIsNotDefined() {
    ObjectNode content = mapper.createObjectNode(); // no "fields" -> no key "expectations"

    InjectorContract contract = InjectorContractFixture.createInjectorContract(content);
    ObjectNode result = getDynamicInjectorContractFieldsForInject(contract);

    assertNull(result);
  }

  private ObjectNode createContentWithField(
      String key, String cardinality, ArrayNode predefinedExpectations) {
    ObjectNode field = mapper.createObjectNode();
    field.put("key", key);
    field.put("cardinality", cardinality);
    field.set("predefinedExpectations", predefinedExpectations);

    ArrayNode fieldsArray = mapper.createArrayNode();
    fieldsArray.add(field);

    ObjectNode content = mapper.createObjectNode();
    content.set("fields", fieldsArray);

    return content;
  }

  private ObjectNode createExpectation(String name) {
    ObjectNode expectation = mapper.createObjectNode();
    expectation.put("expectation_name", name);
    return expectation;
  }
}
