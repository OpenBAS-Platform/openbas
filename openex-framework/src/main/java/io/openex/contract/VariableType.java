package io.openex.contract;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum VariableType {
    @JsonProperty("String")
    String,

    @JsonProperty("Object")
    Object,
}
