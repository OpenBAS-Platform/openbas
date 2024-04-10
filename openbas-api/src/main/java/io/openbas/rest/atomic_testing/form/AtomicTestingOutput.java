package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class AtomicTestingOutput {

  @Schema(description = "Title")
  @JsonProperty("atomic_title")
  private String title;

  @Schema(
      description = "Specifies the categories of targets for atomic testing.",
      example = "assets, asset groups, teams, players"
  )
  @JsonProperty("atomic_target")
  private List<BasicTarget> targets;

  @Schema(description = "Last Execution date")
  @JsonProperty("atomic_last_execution_date")
  private Instant lastExecutionDate;

  @Default
  @Schema(description = "Target of atomic testing as : ")
  @JsonProperty("atomic_expectations")
  private List<BasicExpectation> expectations = new ArrayList<>();
}
