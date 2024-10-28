package io.openbas.injector_contract.fields;

import io.openbas.injector_contract.ContractCardinality;
import io.openbas.injector_contract.ContractType;

public class ContractAssetGroup extends ContractCardinalityElement {

  public ContractAssetGroup(String key, String label, ContractCardinality cardinality) {
    super(key, label, cardinality);
  }

  public static ContractAssetGroup assetGroupField(
      String key, String label, ContractCardinality cardinality) {
    return new ContractAssetGroup(key, label, cardinality);
  }

  @Override
  public ContractType getType() {
    return ContractType.AssetGroup;
  }
}
