package io.openex.contract.fields;

import io.openex.contract.ContractCardinality;

import java.util.ArrayList;
import java.util.List;

public abstract class ContractCardinalityElement extends ContractElement {

    private final ContractCardinality cardinality;
    private List<String> defaultValue = new ArrayList<>();

    public ContractCardinalityElement(String key, String label, ContractCardinality cardinality) {
        super(key, label);
        this.cardinality = cardinality;
    }

    public ContractCardinality getCardinality() {
        return cardinality;
    }

    public List<String> getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(List<String> defaultValue) {
        this.defaultValue = defaultValue;
    }
}
