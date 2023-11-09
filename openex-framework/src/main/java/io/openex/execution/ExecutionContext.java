package io.openex.execution;

import io.openex.config.OpenExConfig;
import io.openex.database.model.Exercise;
import io.openex.database.model.Injection;
import io.openex.database.model.User;

import java.util.HashMap;
import java.util.List;

import static io.openex.contract.variables.VariableHelper.*;

public class ExecutionContext extends HashMap<String, Object> {

  private ExecutionContext(User user, Exercise exercise, List<String> audiences) {
    ProtectUser protectUser = new ProtectUser(user);
    this.put(USER, protectUser);
    this.put(EXERCISE, exercise);
    this.put(AUDIENCES, audiences);
  }

  public ExecutionContext(OpenExConfig config, User user, Injection injection, List<String> audiences) {
    this(user, injection.getExercise(), audiences);
    if (injection.getExercise() != null) {
      String exerciseId = injection.getExercise().getId();
      String queryParams = "?user=" + user.getId() + "&inject=" + injection.getId();
      this.put(PLAYER_URI, config.getBaseUrl() + "/private/" + exerciseId + queryParams);
      this.put(CHALLENGES_URI, config.getBaseUrl() + "/challenges/" + exerciseId + queryParams);
      this.put(SCOREBOARD_URI, config.getBaseUrl() + "/scoreboard/" + exerciseId + queryParams);
      this.put(LESSONS_URI, config.getBaseUrl() + "/lessons/" + exerciseId + queryParams);
    }
  }

  public ExecutionContext(User user, Exercise exercise, String audience) {
    this(user, exercise, List.of(audience));
  }

  public ExecutionContext(OpenExConfig baseUri, User user, Injection injection, String audience) {
    this(baseUri, user, injection, List.of(audience));
  }

  public ProtectUser getUser() {
    return (ProtectUser) this.get(USER);
  }

  public List<String> getAudiences() {
    //noinspection unchecked
    return (List<String>) this.get(AUDIENCES);
  }

  public Exercise getExercise() {
    return (Exercise) this.get(EXERCISE);
  }
}
