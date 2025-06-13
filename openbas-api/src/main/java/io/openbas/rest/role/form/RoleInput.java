package io.openbas.rest.role.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

@Builder(toBuilder = true)
@Getter
@Jacksonized
@EqualsAndHashCode
public class RoleInput {
  @JsonProperty("role_name")
  @NotBlank
  private String name;

  @JsonProperty("role_capabilities")
  private Set<String> capabilities;
}
