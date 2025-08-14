package io.openbas.utils;

import io.openbas.database.model.User;
import io.openbas.database.model.UserOnboardingProgress;
import io.openbas.database.model.UserOnboardingStepStatus;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.stream.Collectors;
import org.jetbrains.annotations.NotNull;

public class UserOnboardingProgressUtils {

  public static final String TECHNICAL_SETUP = "onboarding_technical_setup";
  public static final String ENDPOINT_SETUP = "onboarding_endpoint_setup";
  public static final String COLLECTOR_SETUP = "onboarding_collector_setup";

  public static final String TABLE_TOP_SETUP = "onboarding_table_top_setup";
  public static final String PLAYER_SETUP = "onboarding_player_setup";
  public static final String TEAM_SETUP = "onboarding_team_setup";

  public static final String GET_STARTED = "onboarding_get_started";
  public static final String LAUNCH_SCENARIO_GET_STARTED = "onboarding_launch_scenario_get_started";

  private UserOnboardingProgressUtils() {}

  public static UserOnboardingProgress initializeDefaults(@NotNull final User user) {
    List<String> labels =
        OnboardingConfig.getOnboardingConfig().stream()
            .flatMap(o -> o.items().stream())
            .map(OnboardingConfig.OnboardingItemDTO::labelKey)
            .collect(Collectors.toList());
    List<UserOnboardingStepStatus> steps = buildSteps(labels);
    UserOnboardingProgress progress = new UserOnboardingProgress();
    progress.setProgress(steps);
    progress.setUser(user);
    return progress;
  }

  private static List<UserOnboardingStepStatus> buildSteps(@NotBlank final List<String> labels) {
    return labels.stream().map(s -> UserOnboardingStepStatus.builder().step(s).build()).toList();
  }
}
