package io.openbas.utils;

import io.openbas.database.model.User;
import io.openbas.database.model.UserOnboardingProgress;
import io.openbas.database.model.UserOnboardingStepStatus;
import jakarta.validation.constraints.NotBlank;
import java.util.Arrays;
import java.util.List;
import org.jetbrains.annotations.NotNull;

public class UserOnboardingProgressUtils {

  public static final String TECHNICAL_SETUP = "onboarding_technical_setup";
  public static final String ENDPOINT_SETUP = "onboarding_endpoint_setup";
  public static final String COLLECTOR_SETUP = "onboarding_collector_setup";

  public static final String TABLE_TOP_SETUP = "onboarding_table_top_setup";
  public static final String PLAYER_SETUP = "onboarding_player_setup";
  public static final String TEAM_SETUP = "onboarding_team_setup";

  public static final String GET_STARTED = "onboarding_get_started";
  public static final String OAEV_GET_STARTED = "onboarding_oaev_get_started"; // Not implement yet
  public static final String LAUNCH_SCENARIO_GET_STARTED = "onboarding_launch_scenario_get_started";
  public static final String RBAC_GET_STARTED = "onboarding_rbac_get_started"; // Not implement yet

  private UserOnboardingProgressUtils() {}

  public static UserOnboardingProgress initializeDefaults(@NotNull final User user) {
    List<UserOnboardingStepStatus> steps =
        buildSteps(
            ENDPOINT_SETUP,
            COLLECTOR_SETUP,
            PLAYER_SETUP,
            TEAM_SETUP,
            OAEV_GET_STARTED,
            LAUNCH_SCENARIO_GET_STARTED,
            RBAC_GET_STARTED);
    UserOnboardingProgress progress = new UserOnboardingProgress();
    progress.setProgress(steps);
    progress.setUser(user);
    return progress;
  }

  private static List<UserOnboardingStepStatus> buildSteps(@NotBlank final String... steps) {
    return Arrays.stream(steps)
        .map(s -> UserOnboardingStepStatus.builder().step(s).build())
        .toList();
  }
}
