package io.openbas.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.InjectExpectation;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtomicTestingExpectation {

  public enum EXPECTATION_TYPE {
    TEXT,
    DOCUMENT,
    ARTICLE,
    CHALLENGE,
    MANUAL,
    PREVENTION,
    DETECTION,
  }

  @Setter
  @JsonProperty("atomic_expectation_type")
  @Enumerated(EnumType.STRING)
  @NotNull
  private EXPECTATION_TYPE type;

  @JsonProperty("atomic_expectation_name")
  private String name;

  @JsonProperty("atomic_expectation_description")
  private String description;

  @JsonProperty("atomic_expectation_score")
  private int score;

  @JsonProperty("atomic_expectation_expectation_group")
  private boolean expectationGroup;
}
