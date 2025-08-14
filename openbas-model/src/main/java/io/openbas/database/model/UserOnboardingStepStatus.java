package io.openbas.database.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Builder
@Data
@Embeddable
@NoArgsConstructor
public class UserOnboardingStepStatus {

  @Column(name = "user_onboarding_status_step", nullable = false)
  private String step;

  @Column(name = "user_onboarding_status_completed", nullable = false)
  private boolean completed;

  @Column(name = "user_onboarding_status_skipped", nullable = false)
  private boolean skipped;
}
