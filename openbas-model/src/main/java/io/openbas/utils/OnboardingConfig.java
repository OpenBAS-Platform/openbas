package io.openbas.utils;

import static io.openbas.utils.UserOnboardingProgressUtils.*;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class OnboardingConfig {

  private OnboardingConfig() {}

  public record OnboardingCategoryDTO(
      @NotBlank String category, @NotBlank String icon, @NotNull List<OnboardingItemDTO> items) {}

  public record OnboardingItemDTO(@NotBlank String labelKey, @NotBlank String videoLink) {}

  public static final String TECHNICAL_SETUP_ICON = "dns";
  public static final String TABLE_TOP_SETUP_ICON = "people";
  public static final String GET_STARTED_ICON = "rocket";

  public static final String VIDEO_URI = "https://app.storylane.io/demo/bxqijbtlfklz";

  public static List<OnboardingCategoryDTO> getOnboardingConfig() {
    return List.of(
        new OnboardingCategoryDTO(
            TECHNICAL_SETUP,
            TECHNICAL_SETUP_ICON,
            List.of(
                new OnboardingItemDTO(ENDPOINT_SETUP, VIDEO_URI),
                new OnboardingItemDTO(COLLECTOR_SETUP, VIDEO_URI))),
        new OnboardingCategoryDTO(
            TABLE_TOP_SETUP,
            TABLE_TOP_SETUP_ICON,
            List.of(
                new OnboardingItemDTO(PLAYER_SETUP, VIDEO_URI),
                new OnboardingItemDTO(TEAM_SETUP, VIDEO_URI))),
        new OnboardingCategoryDTO(
            GET_STARTED,
            GET_STARTED_ICON,
            List.of(new OnboardingItemDTO(LAUNCH_SCENARIO_GET_STARTED, VIDEO_URI))));
  }
}
