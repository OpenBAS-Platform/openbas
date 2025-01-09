package io.openbas.rest.tag_rule.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

@Builder(toBuilder = true)
@Getter
@Jacksonized
@EqualsAndHashCode
public class TagRuleInput {
  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("tag_name")
  private String tagName;

  @JsonProperty("asset_groups")
  private List<String> assetGroups = new ArrayList<>();
}
