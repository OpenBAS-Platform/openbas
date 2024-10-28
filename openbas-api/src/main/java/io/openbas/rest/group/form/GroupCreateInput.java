package io.openbas.rest.group.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Grant;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupCreateInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("group_name")
  private String name;

  @JsonProperty("group_description")
  private String description;

  @JsonProperty("group_default_user_assign")
  private boolean defaultUserAssignation;

  @JsonProperty("group_default_exercise_observer")
  private boolean defaultExerciseObserver;

  @JsonProperty("group_default_exercise_planner")
  private boolean defaultExercisePlanner;

  @JsonProperty("group_default_scenario_observer")
  private boolean defaultScenarioObserver;

  @JsonProperty("group_default_scenario_planner")
  private boolean defaultScenarioPlanner;

  public List<Grant.GRANT_TYPE> defaultExerciseGrants() {
    List<Grant.GRANT_TYPE> grants = new ArrayList<>();
    if (this.defaultExercisePlanner) {
      grants.add(Grant.GRANT_TYPE.PLANNER);
    }
    if (this.defaultExerciseObserver) {
      grants.add(Grant.GRANT_TYPE.OBSERVER);
    }
    return grants;
  }

  public List<Grant.GRANT_TYPE> defaultScenarioGrants() {
    List<Grant.GRANT_TYPE> grants = new ArrayList<>();
    if (this.defaultScenarioPlanner) {
      grants.add(Grant.GRANT_TYPE.PLANNER);
    }
    if (this.defaultScenarioObserver) {
      grants.add(Grant.GRANT_TYPE.OBSERVER);
    }
    return grants;
  }
}
