package io.openbas.rest.atomic_testing.form;

import static lombok.AccessLevel.NONE;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.ExecutionStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class InjectStatusSimple {

  @Schema(description = "Id")
  @JsonProperty("status_id")
  @NotNull
  private String id;

  @Getter(NONE)
  @Schema(description = "Name")
  @JsonProperty("status_name")
  private String name;

  public String getName() {
    if (name == null) {
      return ExecutionStatus.DRAFT.name();
    }
    return name;
  }

  @Schema(description = "Tracking Send Date")
  @JsonProperty("tracking_sent_date")
  private Instant trackingSentDate;
}
