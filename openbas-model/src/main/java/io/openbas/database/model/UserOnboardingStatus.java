package io.openbas.database.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public enum UserOnboardingStatus {
  DEFAULT("default"),
  ENABLED("enabled"),
  DISABLED("disabled");

  private final String value;

  UserOnboardingStatus(@NotBlank final String value) {
    this.value = value;
  }

  public static UserOnboardingStatus fromString(@NotBlank final String value) {
    for (UserOnboardingStatus status : UserOnboardingStatus.values()) {
      if (status.value.equalsIgnoreCase(value)) {
        return status;
      }
    }
    return DEFAULT;
  }
}
