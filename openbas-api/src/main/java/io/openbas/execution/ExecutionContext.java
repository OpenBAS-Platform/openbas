package io.openbas.execution;

import io.openbas.injector_contract.variables.VariableHelper;
import io.openbas.database.model.User;

import java.util.HashMap;
import java.util.List;

public class ExecutionContext extends HashMap<String, Object> {

  public ExecutionContext(User user, List<String> teams) {
    ProtectUser protectUser = new ProtectUser(user);
    this.put(VariableHelper.USER, protectUser);
    this.put(VariableHelper.TEAMS, teams);
  }

  public ProtectUser getUser() {
    return (ProtectUser) this.get(VariableHelper.USER);
  }

  public List<String> getTeams() {
    //noinspection unchecked
    return (List<String>) this.get(VariableHelper.TEAMS);
  }
}
