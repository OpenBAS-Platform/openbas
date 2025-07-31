package io.openbas.rest.injector_contract.input;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.utils.pagination.SearchPaginationInput;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SearchPaginationWithSerialisationOptionsInput extends SearchPaginationInput {
  @JsonProperty("serialisation_options")
  private SerialisationOptions options;
}
