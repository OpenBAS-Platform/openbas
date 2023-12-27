package io.openex.contract.fields;

import io.openex.contract.ContractCardinality;
import io.openex.contract.ContractType;

public class ContractTeam extends ContractCardinalityElement {

    public ContractTeam(String key, String label, ContractCardinality cardinality) {
        super(key, label, cardinality);
    }

    public static ContractTeam teamField(String key, String label, ContractCardinality cardinality) {
        return new ContractTeam(key, label, cardinality);
    }

    @Override
    public ContractType getType() {
        return ContractType.Team;
    }
}
