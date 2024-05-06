package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.InjectDocument;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.Tag;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
public class AtomicTestingDetailOutput {

  @JsonProperty("inject_id")
  @Enumerated(EnumType.STRING)
  @NotBlank
  private String atomicId;

  @JsonProperty("inject_description")
  private String description;

  @JsonProperty("atomic_injector_label")
  private Map<String, String> injectorLabel = new HashMap<>();

  @JsonProperty("inject_content")
  private ObjectNode content;

  @JsonProperty("inject_expectations")
  private List<InjectExpectation> expectations = new ArrayList<>();

  @JsonProperty("inject_tags")
  private List<Tag> tags = new ArrayList<>();

  @JsonProperty("inject_documents")
  private List<InjectDocument> documents = new ArrayList<>();

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
