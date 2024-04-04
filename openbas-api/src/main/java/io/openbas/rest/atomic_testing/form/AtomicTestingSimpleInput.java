package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AtomicTestingSimpleInput {

  @Schema(description = "Title")
  @JsonProperty("atomic_title")
  @NotNull
  private String title;

}
