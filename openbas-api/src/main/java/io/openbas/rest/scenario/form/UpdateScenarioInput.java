package io.openbas.rest.scenario.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.Getter;

@Data
@Getter
public class UpdateScenarioInput extends ScenarioInput {
  @JsonProperty("apply_tag_rule")
  @Schema(description = "True if we want to apply tag rules")
  private boolean applyTagRule = false;
}
