package io.openbas.utils.fixtures.files;

import io.openbas.database.model.AttackPattern;

public class AttackPatternFixture {

  public static AttackPattern createDefaultAttackPattern() {
    AttackPattern attackPattern = new AttackPattern();
    attackPattern.setName("Remote Access Software");
    attackPattern.setExternalId("Test1219");
    attackPattern.setStixId("attack-pattern-test--4061e78c-1284-44b4-9116-73e4ac3912f7");
    return attackPattern;
  }
}
