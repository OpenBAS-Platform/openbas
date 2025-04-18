package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Represents the output result details of an player")
public class PlayerStatusOutput {

  @JsonProperty("player_id")
  @NotNull
  private String playerId;

  @JsonProperty("player_status_name")
  @Schema(
      description = "Execution status of the player",
      example = "SUCCESS, ERROR, MAYBE_PREVENTED...")
  private String statusName;

  @Builder.Default
  @JsonProperty("player_traces")
  @Schema(description = "List of player execution traces")
  private List<ExecutionTracesOutput> playerTraces = new ArrayList<>();

  @JsonProperty("tracking_sent_date")
  private Instant trackingSentDate;

  @JsonProperty("tracking_end_date")
  private Instant trackingEndDate;
}
