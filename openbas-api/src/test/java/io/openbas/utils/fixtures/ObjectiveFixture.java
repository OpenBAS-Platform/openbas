package io.openbas.utils.fixtures;

import io.openbas.database.model.Objective;

public class ObjectiveFixture {

  public static final String OBJECTIVE_NAME = "My Objective";

  public static Objective getObjective() {
    Objective objective = new Objective();
    objective.setTitle(OBJECTIVE_NAME);
    return objective;
  }
}
