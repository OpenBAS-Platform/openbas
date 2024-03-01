package io.openbas.contract.fields;

import io.openbas.contract.ContractCardinality;
import io.openbas.contract.ContractType;

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
