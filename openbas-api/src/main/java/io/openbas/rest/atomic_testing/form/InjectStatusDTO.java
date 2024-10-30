package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Setter
@Getter
@Builder
public class InjectStatusDTO {

  @Schema(description = "Id")
  @JsonProperty("status_id")
  @NotNull
  private String id;

  @Schema(description = "Name")
  @JsonProperty("status_name")
  private String name;

  @Schema(description = "Tracking Send Date")
  @JsonProperty("tracking_sent_date")
  private Instant trackingSentDate;

}
