package io.openbas.rest.payload.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegexGroupInput {

  @JsonProperty("regex_group_field")
  @Schema(description = "Field")
  private String field;

  @JsonProperty("regex_group_index")
  @Schema(description = "Index of the group from the regex match")
  private int index;
}
