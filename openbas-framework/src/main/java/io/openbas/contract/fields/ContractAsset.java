package io.openbas.contract.fields;

import io.openbas.contract.ContractCardinality;
import io.openbas.contract.ContractType;

public class ContractAsset extends ContractCardinalityElement {

  public ContractAsset(String key, String label, ContractCardinality cardinality) {
    super(key, label, cardinality);
  }

  public static ContractAsset assetField(String key, String label, ContractCardinality cardinality) {
    return new ContractAsset(key, label, cardinality);
  }

  @Override
  public ContractType getType() {
    return ContractType.Asset;
  }
}
