package io.openex.rest.exercise.exports;

import com.fasterxml.jackson.annotation.JsonIncludeProperties;
import com.fasterxml.jackson.databind.JsonNode;
import io.openex.database.model.Variable;

import javax.validation.constraints.NotNull;

import static io.openex.rest.exercise.exports.VariableMixin.*;

@JsonIncludeProperties(value = {
    VARIABLE_ID,
    VARIABLE_KEY,
    VARIABLE_DESCRIPTION,
})
public abstract class VariableMixin {

  static final String VARIABLE_ID = "variable_id";
  static final String VARIABLE_KEY = "variable_key";
  static final String VARIABLE_DESCRIPTION = "variable_description";

  public static String getId(@NotNull final JsonNode node) {
    return node.get(VariableMixin.VARIABLE_ID).textValue();
  }

  public static Variable build(@NotNull final JsonNode node) {
    Variable variable = new Variable();
    variable.setKey(node.get(VariableMixin.VARIABLE_KEY).asText());
    variable.setDescription(node.get(VariableMixin.VARIABLE_DESCRIPTION).asText());
    return variable;
  }

}
