package io.openbas.rest.asset.endpoint.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class ExecutorOutput {

  @Schema(description = "Agent executor id")
  @JsonProperty("executor_id")
  private String id;

  @Schema(description = "Agent executor name")
  @JsonProperty("executor_name")
  private String name;

  @Schema(description = "Agent executor type")
  @JsonProperty("executor_type")
  private String type;
}
