package io.openbas.jsonapi;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record JsonApiDocument<T>(T data, List<Object> included) {}
