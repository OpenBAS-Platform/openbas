package io.openbas.injectorContract.fields;

import io.openbas.injector_contract.ContractCardinality;

public class ContractAsset extends ContractCardinalityElement {

  public ContractAsset(String key, String label, ContractCardinality cardinality) {
    super(key, label, cardinality);
  }

  public static ContractAsset assetField(
      String key, String label, ContractCardinality cardinality) {
    return new ContractAsset(key, label, cardinality);
  }

  @Override
  public ContractFieldType getType() {
    return ContractFieldType.Asset;
  }
}
