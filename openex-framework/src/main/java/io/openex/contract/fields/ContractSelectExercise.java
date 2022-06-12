package io.openex.contract.fields;

import io.openex.contract.ContractCardinality;
import io.openex.contract.ContractType;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ContractSelectExercise extends ContractCardinalityElement {

    private Map<String, Map<String, String>> choices = new HashMap<>();

    public ContractSelectExercise(String key, String label, ContractCardinality cardinality) {
        super(key, label, cardinality);
    }

    public static ContractSelectExercise selectField(String key, String label, Map<String, Map<String, String>> choices) {
        ContractSelectExercise contractSelect = new ContractSelectExercise(key, label, ContractCardinality.One);
        contractSelect.setChoices(choices);
        return contractSelect;
    }

    public static ContractSelectExercise selectFieldWithDefault(String key, String label, Map<String, Map<String, String>> choices, String def) {
        ContractSelectExercise contractSelect = new ContractSelectExercise(key, label, ContractCardinality.One);
        contractSelect.setChoices(choices);
        contractSelect.setDefaultValue(List.of(def));
        return contractSelect;
    }

    public static ContractSelectExercise multiSelectField(String key, String label, Map<String, Map<String, String>> choices) {
        ContractSelectExercise contractSelect = new ContractSelectExercise(key, label, ContractCardinality.Multiple);
        contractSelect.setChoices(choices);
        return contractSelect;
    }

    @Override
    public ContractType getType() {
        return ContractType.ExerciseSelect;
    }

    public Map<String, Map<String, String>> getChoices() {
        return choices;
    }

    public void setChoices(Map<String, Map<String, String>> choices) {
        this.choices = choices;
    }
}
