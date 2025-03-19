package io.openbas.injector_contract.fields;

import io.openbas.injector_contract.ContractCardinality;

public class ContractChallenge extends ContractCardinalityElement {

  public ContractChallenge(String key, String label, ContractCardinality cardinality) {
    super(key, label, cardinality);
  }

  public static ContractChallenge challengeField(
      String key, String label, ContractCardinality cardinality) {
    return new ContractChallenge(key, label, cardinality);
  }

  @Override
  public ContractFieldType getType() {
    return ContractFieldType.Challenge;
  }
}
