package io.openbas.rest.notification_rule.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationRuleOutput {
  @JsonProperty("id")
  private String id;

  @JsonProperty("resource_type")
  private String resourceType;

  @JsonProperty("resource_id")
  private String resourceId;

  @JsonProperty("trigger")
  private String trigger;

  @JsonProperty("subject")
  private String subject;

  @JsonProperty("owner")
  private String ownerId;
}
