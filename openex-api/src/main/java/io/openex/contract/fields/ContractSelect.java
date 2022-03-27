package io.openex.contract.fields;

import io.openex.contract.ContractCardinality;
import io.openex.contract.ContractType;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ContractSelect extends ContractCardinalityElement {

    private Map<String, String> choices = new HashMap<>();

    public ContractSelect(String key, String label, ContractCardinality cardinality) {
        super(key, label, cardinality);
    }

    public static ContractSelect selectField(String key, String label, Map<String, String> choices) {
        ContractSelect contractSelect = new ContractSelect(key, label, ContractCardinality.One);
        contractSelect.setChoices(choices);
        return contractSelect;
    }

    public static ContractSelect selectFieldWithDefault(String key, String label, Map<String, String> choices, String def) {
        ContractSelect contractSelect = new ContractSelect(key, label, ContractCardinality.One);
        contractSelect.setChoices(choices);
        contractSelect.setDefaultValue(List.of(def));
        return contractSelect;
    }

    public static ContractSelect multiSelectField(String key, String label, Map<String, String> choices) {
        ContractSelect contractSelect = new ContractSelect(key, label, ContractCardinality.Multiple);
        contractSelect.setChoices(choices);
        return contractSelect;
    }

    @Override
    public ContractType getType() {
        return ContractType.Select;
    }

    public Map<String, String> getChoices() {
        return choices;
    }

    public void setChoices(Map<String, String> choices) {
        this.choices = choices;
    }
}
