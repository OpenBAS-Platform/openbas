package io.openbas.injector_contract.fields;

import io.openbas.injector_contract.ContractCardinality;
import io.openbas.injector_contract.ContractType;

public class ContractChallenge extends ContractCardinalityElement {

  public ContractChallenge(String key, String label, ContractCardinality cardinality) {
    super(key, label, cardinality);
  }

  public static ContractChallenge challengeField(
      String key, String label, ContractCardinality cardinality) {
    return new ContractChallenge(key, label, cardinality);
  }

  @Override
  public ContractType getType() {
    return ContractType.Challenge;
  }
}
