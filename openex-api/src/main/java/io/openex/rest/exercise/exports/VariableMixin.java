package io.openex.rest.exercise.exports;

import com.fasterxml.jackson.annotation.JsonIncludeProperties;

@JsonIncludeProperties(value = {
    "variable_id",
    "variable_key",
    "variable_description",
})
public abstract class VariableMixin { }
