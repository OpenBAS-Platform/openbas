package io.openbas.rest.exercise.form;

import static io.openbas.config.AppConfig.*;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class UpdateExerciseInput extends ExerciseInput {
  @JsonProperty("apply_tag_rule")
  private boolean applyTagRule = false;
}
