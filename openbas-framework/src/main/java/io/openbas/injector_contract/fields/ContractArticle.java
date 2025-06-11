package io.openbas.injector_contract.fields;

import static io.openbas.database.model.InjectorContract.CONTACT_ELEMENT_CONTENT_KEY_ARTICLES;

import io.openbas.injector_contract.ContractCardinality;

public class ContractArticle extends ContractCardinalityElement {

  public ContractArticle(ContractCardinality cardinality) {
    super(CONTACT_ELEMENT_CONTENT_KEY_ARTICLES, "Articles", cardinality);
  }

  public static ContractArticle articleField(ContractCardinality cardinality) {
    return new ContractArticle(cardinality);
  }

  @Override
  public ContractFieldType getType() {
    return ContractFieldType.Article;
  }
}
