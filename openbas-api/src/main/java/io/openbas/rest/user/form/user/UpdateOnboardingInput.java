package io.openbas.rest.user.form.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.UserOnboardingStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOnboardingInput {

  @NotNull
  @JsonProperty("user_onboarding_widget_enable")
  @Schema(description = "User onboarding widget enabled")
  private UserOnboardingStatus onboardingWidgetEnable;

  @NotNull
  @JsonProperty("user_onboarding_contextual_help_enable")
  @Schema(description = "User onboarding contextual help enabled")
  private UserOnboardingStatus onboardingContextualHelpEnable;
}
