package io.openbas.rest.settings.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class SettingsOnboardingUpdateInput {

  @JsonProperty("platform_onboarding_widget_enable")
  @Schema(description = "Platform onboarding widget enabled")
  private boolean onboardingWidgetEnable;

  @JsonProperty("platform_onboarding_contextual_help_enable")
  @Schema(description = "Platform onboarding contextual help enabled")
  private boolean onboardingContextualHelpEnable;
}
