package io.openbas.rest.notification_rule.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

@Jacksonized
@Getter
@Builder
public class UpdateNotificationRuleInput {
  @JsonProperty("notification_rule_subject")
  private String subject;
}
