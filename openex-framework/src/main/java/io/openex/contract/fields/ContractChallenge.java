package io.openex.contract.fields;

import io.openex.contract.ContractCardinality;
import io.openex.contract.ContractType;

public class ContractChallenge extends ContractCardinalityElement {

    public ContractChallenge(String key, String label, ContractCardinality cardinality) {
        super(key, label, cardinality);
    }

    public static ContractChallenge challengeField(String key, String label, ContractCardinality cardinality) {
        return new ContractChallenge(key, label, cardinality);
    }

    @Override
    public ContractType getType() {
        return ContractType.Challenge;
    }
}
