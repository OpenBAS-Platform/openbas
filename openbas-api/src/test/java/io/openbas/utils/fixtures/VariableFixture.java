package io.openbas.utils.fixtures;

import io.openbas.database.model.Variable;

public class VariableFixture {
  public static Variable getVariable() {
    Variable var = new Variable();
    var.setKey("variable_key");
    var.setValue("variable value");
    var.setDescription("variable description");
    return var;
  }
}
