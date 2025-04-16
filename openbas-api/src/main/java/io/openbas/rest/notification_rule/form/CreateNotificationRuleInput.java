package io.openbas.rest.notification_rule.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

@Jacksonized
@Getter
@Builder(toBuilder = true)
public class CreateNotificationRuleInput {

  @JsonProperty("resource_type")
  private String resourceType;

  @JsonProperty("resource_id")
  private String resourceId;

  @JsonProperty("trigger")
  private String trigger;

  @JsonProperty("type")
  private String type;

  @JsonProperty("subject")
  @NotNull
  private String subject;
}
