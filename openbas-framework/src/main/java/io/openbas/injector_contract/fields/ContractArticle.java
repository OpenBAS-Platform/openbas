package io.openbas.injector_contract.fields;

import io.openbas.injector_contract.ContractCardinality;

public class ContractArticle extends ContractCardinalityElement {

  public ContractArticle(String key, String label, ContractCardinality cardinality) {
    super(key, label, cardinality);
  }

  public static ContractArticle articleField(
      String key, String label, ContractCardinality cardinality) {
    return new ContractArticle(key, label, cardinality);
  }

  @Override
  public ContractFieldType getType() {
    return ContractFieldType.Article;
  }
}
