package io.openbas.rest.injector_contract;

import static io.openbas.database.model.InjectorContract.*;
import static io.openbas.database.model.InjectorContract.DEFAULT_VALUE_FIELD;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.InjectorContract;
import io.openbas.injector_contract.outputs.InjectorContractContentOutputElement;
import java.util.List;
import java.util.stream.StreamSupport;
import org.jetbrains.annotations.NotNull;

public class InjectorContractContentUtils {

  public static final String OUTPUTS = "outputs";
  public static final String FIELDS = "fields";

  private InjectorContractContentUtils() {}

  /**
   * Function used to get the outputs from the injector contract content.
   *
   * @param content Injector Contract content
   * @param mapper ObjectMapper used to convert JSON to Java objects
   * @return List of ContractOutputElement ( from Injector contract content )
   */
  public static List<InjectorContractContentOutputElement> getContractOutputs(
      @NotNull final ObjectNode content, ObjectMapper mapper) {
    return StreamSupport.stream(content.get(OUTPUTS).spliterator(), false)
        .map(
            jsonNode -> {
              try {
                return mapper.treeToValue(jsonNode, InjectorContractContentOutputElement.class);
              } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Error processing JSON: " + jsonNode, e);
              }
            })
        .toList();
  }

  /**
   * Function used to get the dynamic fields for inject from the injector contract.
   *
   * @param injectorContract InjectorContract object containing the converted content
   * @return ObjectNode containing the dynamic fields for inject
   */
  public static ObjectNode getDynamicInjectorContractFieldsForInject(
      InjectorContract injectorContract) {
    ObjectNode convertedContent = injectorContract.getConvertedContent();

    if (convertedContent.has("fields") && convertedContent.get("fields").isArray()) {
      ArrayNode fieldsArray = (ArrayNode) convertedContent.get("fields");
      ArrayNode fieldsNode = fieldsArray.deepCopy();
      ObjectNode injectContent = new ObjectMapper().createObjectNode();

      for (JsonNode field : fieldsNode) {
        String key = field.get(CONTRACT_ELEMENT_CONTENT_KEY).asText();
        if (!CONTRACT_ELEMENT_CONTENT_KEY_NOT_DYNAMIC.contains(key)
            && field.hasNonNull(DEFAULT_VALUE_FIELD)) {
          injectContent.set(key, field.get(DEFAULT_VALUE_FIELD));
        }
      }

      return injectContent;
    }

    return null;
  }
}
