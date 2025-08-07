package io.openbas.api.onboarding;

import static io.openbas.database.model.User.ROLE_USER;

import io.openbas.database.model.UserOnboardingProgress;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.onboarding.OnboardingService;
import io.openbas.utils.OnboardingConfig;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
public class OnboardingApi extends RestBehavior {

  public static final String ONBOARDING_URI = "/api/onboarding";

  private final OnboardingService onboardingService;

  @GetMapping(ONBOARDING_URI)
  @Transactional(readOnly = true)
  public UserOnboardingProgress getOnboardingProgress() {
    return onboardingService.userOnboardingProgress();
  }

  @GetMapping(ONBOARDING_URI + "/config")
  public List<OnboardingConfig.OnboardingCategoryDTO> getOnboardingConfig() {
    return OnboardingConfig.getOnboardingConfig();
  }

  @PutMapping(ONBOARDING_URI + "/skipped")
  public UserOnboardingProgress skippedCategory(@RequestBody @NotNull final List<String> steps) {
    return this.onboardingService.skippedSkipped(steps);
  }
}
