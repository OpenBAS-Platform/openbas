package io.openbas.injector_contract.fields;

import static io.openbas.database.model.InjectorContract.CONTRACT_ELEMENT_CONTENT_KEY_CHALLENGES;

import io.openbas.injector_contract.ContractCardinality;

public class ContractChallenge extends ContractCardinalityElement {

  public ContractChallenge(ContractCardinality cardinality) {
    super(CONTRACT_ELEMENT_CONTENT_KEY_CHALLENGES, "Challenges", cardinality);
  }

  public static ContractChallenge challengeField(ContractCardinality cardinality) {
    return new ContractChallenge(cardinality);
  }

  @Override
  public ContractFieldType getType() {
    return ContractFieldType.Challenge;
  }
}
