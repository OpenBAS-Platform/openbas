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

  @Column(name = "step", nullable = false)
  private String step;

  @Column(name = "completed", nullable = false)
  private boolean completed;

  @Column(name = "skipped", nullable = false)
  private boolean skipped;
}
