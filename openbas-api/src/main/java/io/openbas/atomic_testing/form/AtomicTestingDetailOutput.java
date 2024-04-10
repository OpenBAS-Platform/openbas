package io.openbas.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.ExecutionStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AtomicTestingDetailOutput {

  @JsonProperty("atomic_id")
  @Enumerated(EnumType.STRING)
  private String atomicId;

  @JsonProperty("status_label")
  @Enumerated(EnumType.STRING)
  private ExecutionStatus status;

  @JsonProperty("status_traces")
  private List<String> traces;

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
