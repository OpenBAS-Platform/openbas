package io.openbas.service.onboarding;

import static io.openbas.utils.UserOnboardingProgressUtils.*;

import io.openbas.api.onboarding.output.OnboardingCategoryDTO;
import io.openbas.api.onboarding.output.OnboardingItemDTO;
import java.util.List;

public class OnboardingConfig {

  private OnboardingConfig() {}

  public static final String TECHNICAL_SETUP_ICON = "dns";
  public static final String TABLE_TOP_SETUP_ICON = "people";
  public static final String GET_STARTED_ICON = "rocket";

  public static final String VIDEO_URI = "https://app.storylane.io/demo/bxqijbtlfklz";

  public static final String SCENARIO_BASE_URL = "/admin/scenarios";
  public static final String ENDPOINT_BASE_URL = "/admin/assets/endpoints";
  public static final String PLAYER_BASE_URL = "/admin/teams/players";
  public static final String TEAM_BASE_URL = "/admin/teams/teams";
  public static final String COLLECTOR_BASE_URL = "/admin/integrations/collectors";

  public static List<OnboardingCategoryDTO> getOnboardingConfig() {
    return List.of(
        new OnboardingCategoryDTO(
            TECHNICAL_SETUP,
            TECHNICAL_SETUP_ICON,
            List.of(
                new OnboardingItemDTO(ENDPOINT_BASE_URL, ENDPOINT_SETUP, VIDEO_URI),
                new OnboardingItemDTO(COLLECTOR_BASE_URL, COLLECTOR_SETUP, VIDEO_URI))),
        new OnboardingCategoryDTO(
            TABLE_TOP_SETUP,
            TABLE_TOP_SETUP_ICON,
            List.of(
                new OnboardingItemDTO(PLAYER_BASE_URL, PLAYER_SETUP, VIDEO_URI),
                new OnboardingItemDTO(TEAM_BASE_URL, TEAM_SETUP, VIDEO_URI))),
        new OnboardingCategoryDTO(
            GET_STARTED,
            GET_STARTED_ICON,
            List.of(
                new OnboardingItemDTO(SCENARIO_BASE_URL, LAUNCH_SCENARIO_GET_STARTED, VIDEO_URI))));
  }
}
