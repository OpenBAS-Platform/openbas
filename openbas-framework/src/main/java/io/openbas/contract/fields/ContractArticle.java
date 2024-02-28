package io.openbas.contract.fields;

import io.openbas.contract.ContractCardinality;
import io.openbas.contract.ContractType;

public class ContractArticle extends ContractCardinalityElement {

    public ContractArticle(String key, String label, ContractCardinality cardinality) {
        super(key, label, cardinality);
    }

    public static ContractArticle articleField(String key, String label, ContractCardinality cardinality) {
        return new ContractArticle(key, label, cardinality);
    }

    @Override
    public ContractType getType() {
        return ContractType.Article;
    }
}
