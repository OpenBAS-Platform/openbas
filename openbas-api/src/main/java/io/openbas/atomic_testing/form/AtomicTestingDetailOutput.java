package io.openbas.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AtomicTestingDetailOutput {

  @Schema(description = "Title")
  @JsonProperty("atomic_title")
  @NotNull
  private String title;

  @Schema(description = "Status")
  @JsonProperty("atomic_status")
  @NotNull
  private String status;
}
