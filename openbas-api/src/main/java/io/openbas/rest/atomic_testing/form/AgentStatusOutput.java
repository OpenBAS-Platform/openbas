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
@Schema(description = "Represents the output result details of an agent execution")
public class AgentStatusOutput {

  @JsonProperty("asset_id")
  @Schema(description = "Endpoint ID")
  @NotNull
  private String assetId;

  @JsonProperty("agent_id")
  @NotNull
  private String agentId;

  @JsonProperty("agent_name")
  private String agentName;

  @JsonProperty("agent_executor_name")
  private String agentExecutorName;

  @JsonProperty("agent_executor_type")
  private String agentExecutorType;

  @JsonProperty("tracking_sent_date")
  private Instant trackingSentDate;

  @JsonProperty("tracking_end_date")
  private Instant trackingEndDate;

  @JsonProperty("agent_status_name")
  @Schema(
      description = "Execution status of the agent",
      example = "SUCCESS, ERROR, MAYBE_PREVENTED...")
  private String statusName;

  @Builder.Default
  @JsonProperty("agent_traces")
  @Schema(description = "List of agent execution traces")
  private List<ExecutionTracesOutput> agentTraces = new ArrayList<>();
}
