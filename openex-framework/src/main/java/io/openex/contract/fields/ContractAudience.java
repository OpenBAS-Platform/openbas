package io.openex.contract.fields;

import io.openex.contract.ContractCardinality;
import io.openex.contract.ContractType;

public class ContractAudience extends ContractCardinalityElement {

    public ContractAudience(String key, String label, ContractCardinality cardinality) {
        super(key, label, cardinality);
    }

    public static ContractAudience audienceField(String key, String label, ContractCardinality cardinality) {
        return new ContractAudience(key, label, cardinality);
    }

    @Override
    public ContractType getType() {
        return ContractType.Audience;
    }
}
