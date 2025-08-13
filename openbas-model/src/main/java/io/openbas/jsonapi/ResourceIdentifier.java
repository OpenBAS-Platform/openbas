package io.openbas.jsonapi;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ResourceIdentifier(@NotBlank String id, @NotBlank String type) {}
