package io.openex.contract.variables;

import io.openex.contract.ContractVariable;

import java.util.List;

import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractCardinality.One;
import static io.openex.contract.ContractVariable.variable;
import static io.openex.contract.VariableType.Object;
import static io.openex.contract.VariableType.String;
import static io.openex.execution.ExecutionContext.*;

public class VariableHelper {

  public static final ContractVariable userVariable = variable(USER, "User that will receive the injection", Object, One, List.of(
      variable(USER + ".id", "Id of the user in the platform", String, One),
      variable(USER + ".email", "Email of the user", String, One),
      variable(USER + ".firstname", "Firstname of the user", String, One),
      variable(USER + ".lastname", "Lastname of the user", String, One),
      variable(USER + ".lang", "Lang of the user", String, One)
  ));

  public static final ContractVariable exerciceVariable = variable(EXERCISE, "Exercise of the current injection", Object, One, List.of(
      variable(EXERCISE + ".id", "Id of the user in the platform", String, One),
      variable(EXERCISE + ".name", "Name of the exercise", String, One),
      variable(EXERCISE + ".description", "Description of the exercise", String, One)
  ));

  public static final ContractVariable audienceVariable = variable(AUDIENCES, "List of audience name for the injection", String, Multiple);

  public static final List<ContractVariable> uriVariables = List.of(
      variable(PLAYER_URI, "Player interface platform link", String, One),
      variable(CHALLENGES_URI, "Challenges interface platform link", String, One),
      variable(SCOREBOARD_URI, "Scoreboard interface platform link", String, One),
      variable(LESSONS_URI, "Lessons learned interface platform link", String, One)
  );

}
