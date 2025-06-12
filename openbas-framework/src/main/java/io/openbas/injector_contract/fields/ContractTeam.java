package io.openbas.injector_contract.fields;

import static io.openbas.database.model.InjectorContract.CONTRACT_ELEMENT_CONTENT_KEY_TEAMS;

import io.openbas.injector_contract.ContractCardinality;

public class ContractTeam extends ContractCardinalityElement {

  public ContractTeam(ContractCardinality cardinality) {
    super(CONTRACT_ELEMENT_CONTENT_KEY_TEAMS, "Teams", cardinality);
  }

  public static ContractTeam teamField(ContractCardinality cardinality) {
    return new ContractTeam(cardinality);
  }

  @Override
  public ContractFieldType getType() {
    return ContractFieldType.Team;
  }
}
