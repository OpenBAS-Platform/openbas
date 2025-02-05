package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;

@Builder
public class AgentStatusOutput {

  @JsonProperty("asset_id")
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
  private String statusName;

  @Builder.Default
  @JsonProperty("agent_traces")
  private List<ExecutionTracesOutput> agentTraces = new ArrayList<>();
}
