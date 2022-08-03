package io.openex.contract;

import java.util.List;

public class ContractVariable {

    private final String key;

    private final String label;

    private final VariableType type;

    private final ContractCardinality cardinality;

    private final List<ContractVariable> children;

    private ContractVariable(String key, String label, VariableType type, ContractCardinality cardinality, List<ContractVariable> children) {
        this.key = key;
        this.label = label;
        this.type = type;
        this.cardinality = cardinality;
        this.children = children;
    }

    public static ContractVariable variable(String key, String label, VariableType type, ContractCardinality cardinality) {
        return new ContractVariable(key, label, type, cardinality, List.of());
    }

    public static ContractVariable variable(String key, String label, VariableType type, ContractCardinality cardinality, List<ContractVariable> children) {
        return new ContractVariable(key, label, type, cardinality, children);
    }

    public String getKey() {
        return key;
    }

    public String getLabel() {
        return label;
    }

    public VariableType getType() {
        return type;
    }

    public ContractCardinality getCardinality() {
        return cardinality;
    }

    public List<ContractVariable> getChildren() {
        return children;
    }
}
