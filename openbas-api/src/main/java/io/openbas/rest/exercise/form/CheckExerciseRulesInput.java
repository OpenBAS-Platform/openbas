package io.openbas.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Data;

@Data
public class CheckExerciseRulesInput {
  @JsonProperty("new_tags")
  List<String> newTags;
}
