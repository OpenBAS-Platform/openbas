package io.openbas.rest.exercise.form;

import static java.time.Instant.now;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.database.model.ExerciseStatus;
import io.openbas.database.model.Tag;
import io.openbas.helper.MultiIdSetDeserializer;
import io.openbas.rest.atomic_testing.form.TargetSimple;
import io.openbas.utils.InjectMapper;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ExerciseSimple {

  @JsonProperty("exercise_id")
  @NotBlank
  private String id;

  @JsonProperty("exercise_name")
  @NotBlank
  private String name;

  @JsonProperty("exercise_status")
  @Enumerated(EnumType.STRING)
  private ExerciseStatus status;

  @JsonProperty("exercise_subtitle")
  private String subtitle;

  @JsonProperty("exercise_category")
  private String category;

  @JsonProperty("exercise_start_date")
  private Instant start;

  @JsonProperty("exercise_updated_at")
  private Instant updatedAt = now();

  @JsonSerialize(using = MultiIdSetDeserializer.class)
  @JsonProperty("exercise_tags")
  private Set<Tag> tags = new HashSet<>();

  @JsonIgnore private String[] injectIds;

  @JsonProperty("exercise_global_score")
  private List<InjectMapper.ExpectationResultsByType> expectationResultByTypes = new ArrayList<>();

  @JsonProperty("exercise_targets")
  @NotNull
  private List<TargetSimple> targets;
}
