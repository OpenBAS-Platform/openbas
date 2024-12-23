package io.openbas.rest.tag_rule.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.util.HashMap;
import java.util.Map;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Builder(toBuilder = true)
@Getter
@EqualsAndHashCode
public class TagRuleOutput {
  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("tag_rule_id")
  private String id;

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("tag_name")
  private String tagName;

  @JsonProperty("tag_rule_assets")
  Map<String, String> assets = new HashMap<>();
}
