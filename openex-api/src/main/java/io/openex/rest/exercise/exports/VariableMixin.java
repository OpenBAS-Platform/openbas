package io.openex.rest.exercise.exports;

import com.fasterxml.jackson.annotation.JsonIncludeProperties;

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

}
