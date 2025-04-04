package io.openbas.rest.inject.output;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.util.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class InjectSimple {

  @JsonProperty("inject_id")
  @NotBlank
  private String id;

  @JsonProperty("inject_title")
  @NotBlank
  private String title;

  @JsonProperty("inject_tags")
  private Set<String> tags;
}
