package io.openex.contract.fields;

import io.openex.contract.ContractCardinality;
import io.openex.contract.ContractType;

public class ContractTuple extends ContractCardinalityElement {

    public ContractTuple(String key, String label, ContractCardinality cardinality) {
        super(key, label, cardinality);
    }
    public static ContractTuple tupleField(String key, String label, ContractCardinality cardinality) {
        return new ContractTuple(key, label, cardinality);
    }

    @Override
    public ContractType getType() {
        return ContractType.Tuple;
    }
}
