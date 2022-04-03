package io.openex.contract.fields;

import io.openex.contract.ContractCardinality;
import io.openex.contract.ContractType;

import java.util.HashMap;
import java.util.Map;

public class ContractDependencySelect extends ContractCardinalityElement {

    private final String dependencyField;
    private Map<String, Map<String, String>> choices = new HashMap<>();

    public ContractDependencySelect(String key, String label, String dependencyField, ContractCardinality cardinality) {
        super(key, label, cardinality);
        this.dependencyField = dependencyField;
    }

    public static ContractDependencySelect dependencySelectField(String key, String label, String dependencyField, Map<String, Map<String, String>> choices) {
        ContractDependencySelect contractSelect = new ContractDependencySelect(key, label, dependencyField, ContractCardinality.One);
        contractSelect.setChoices(choices);
        return contractSelect;
    }

    public static ContractDependencySelect dependencyMultiSelectField(String key, String label, String dependencyField, Map<String, Map<String, String>> choices) {
        ContractDependencySelect contractSelect = new ContractDependencySelect(key, label, dependencyField, ContractCardinality.Multiple);
        contractSelect.setChoices(choices);
        return contractSelect;
    }

    @Override
    public ContractType getType() {
        return ContractType.DependencySelect;
    }

    public Map<String, Map<String, String>> getChoices() {
        return choices;
    }

    public void setChoices(Map<String, Map<String, String>> choices) {
        this.choices = choices;
    }

    public String getDependencyField() {
        return dependencyField;
    }
}
