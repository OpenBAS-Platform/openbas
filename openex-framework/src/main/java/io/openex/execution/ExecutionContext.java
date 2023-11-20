package io.openex.execution;

import io.openex.database.model.Exercise;
import io.openex.database.model.User;

import java.util.HashMap;
import java.util.List;

import static io.openex.contract.variables.VariableHelper.*;

public class ExecutionContext extends HashMap<String, Object> {

  public ExecutionContext(User user, Exercise exercise, List<String> audiences) {
    ProtectUser protectUser = new ProtectUser(user);
    this.put(USER, protectUser);
    this.put(EXERCISE, exercise);
    this.put(AUDIENCES, audiences);
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
