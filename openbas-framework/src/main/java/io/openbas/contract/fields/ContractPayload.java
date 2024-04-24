package io.openbas.contract.fields;

import io.openbas.contract.ContractCardinality;
import io.openbas.contract.ContractType;

public class ContractPayload extends ContractCardinalityElement {

  public ContractPayload(String key, String label, ContractCardinality cardinality) {
    super(key, label, cardinality);
  }

  public static ContractPayload payloadField(String key, String label, ContractCardinality cardinality) {
    return new ContractPayload(key, label, cardinality);
  }

  @Override
  public ContractType getType() {
    return ContractType.Payload;
  }
}
