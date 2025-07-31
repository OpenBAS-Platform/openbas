package io.openbas.rest.injector_contract.input;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SerialisationOptions {
  @JsonProperty("excluded_properties")
  private List<String> excludedProperties = new ArrayList<>();
}
