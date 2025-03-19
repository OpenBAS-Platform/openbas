package io.openbas.injector_contract.fields;

import io.openbas.injector_contract.ContractCardinality;

public class ContractAssetGroup extends ContractCardinalityElement {

  public ContractAssetGroup(String key, String label, ContractCardinality cardinality) {
    super(key, label, cardinality);
  }

  public static ContractAssetGroup assetGroupField(
      String key, String label, ContractCardinality cardinality) {
    return new ContractAssetGroup(key, label, cardinality);
  }

  @Override
  public ContractFieldType getType() {
    return ContractFieldType.AssetGroup;
  }
}
