package io.openex.contract.fields;

import io.openex.contract.ContractCardinality;
import io.openex.contract.ContractType;

public class ContractAssetGroup extends ContractCardinalityElement {

  public ContractAssetGroup(String key, String label, ContractCardinality cardinality) {
    super(key, label, cardinality);
  }

  public static ContractAssetGroup assetGroupField(String key, String label, ContractCardinality cardinality) {
    return new ContractAssetGroup(key, label, cardinality);
  }

  @Override
  public ContractType getType() {
    return ContractType.AssetGroup;
  }
}
