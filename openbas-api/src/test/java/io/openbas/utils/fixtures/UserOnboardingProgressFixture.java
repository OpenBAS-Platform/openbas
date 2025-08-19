package io.openbas.utils.fixtures;

import static io.openbas.utils.UserOnboardingProgressUtils.initializeDefaults;

import io.openbas.database.model.User;
import io.openbas.database.model.UserOnboardingProgress;
import jakarta.validation.constraints.NotNull;

public class UserOnboardingProgressFixture {

  public static UserOnboardingProgress createDefaultUserOnboardingProgress(
      @NotNull final User user) {
    return initializeDefaults(user);
  }
}
