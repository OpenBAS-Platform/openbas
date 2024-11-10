package io.openbas.rest.atomic_testing.form;

import static lombok.AccessLevel.NONE;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.InjectStatusExecution;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class InjectStatusOutput {

  @JsonProperty("status_id")
  @NotNull
  private String id;

  @Getter(NONE)
  @JsonProperty("status_name")
  private String name;

  public String getName() {
    if (name == null) {
      return ExecutionStatus.DRAFT.name();
    }
    return name;
  }

  @JsonProperty("status_traces")
  private List<InjectStatusExecution> traces = new ArrayList<>();

  @JsonProperty("tracking_sent_date")
  private Instant trackingSentDate;

  @JsonProperty("tracking_ack_date")
  private Instant trackingAckDate;

  @JsonProperty("tracking_end_date")
  private Instant trackingEndDate;

  @JsonProperty("tracking_total_execution_time")
  private Long trackingTotalExecutionTime;

  @JsonProperty("tracking_total_count")
  private Integer trackingTotalCount;

  @JsonProperty("tracking_total_error")
  private Integer trackingTotalError;

  @JsonProperty("tracking_total_success")
  private Integer trackingTotalSuccess;
}
