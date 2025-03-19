package io.openbas.injectorContract.fields;

import io.openbas.injector_contract.ContractCardinality;

public class ContractTeam extends ContractCardinalityElement {

  public ContractTeam(String key, String label, ContractCardinality cardinality) {
    super(key, label, cardinality);
  }

  public static ContractTeam teamField(String key, String label, ContractCardinality cardinality) {
    return new ContractTeam(key, label, cardinality);
  }

  @Override
  public ContractFieldType getType() {
    return ContractFieldType.Team;
  }
}
