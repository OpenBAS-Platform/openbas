package io.openex.player.contract;

import java.util.ArrayList;
import java.util.List;

import static io.openex.player.contract.ContractType.Text;

public class ContractDef {

    private List<ContractField> fields = new ArrayList<>();

    private ContractDef() {
        //private constructor
    }

    public static ContractDef build() {
        return new ContractDef();
    }

    public ContractDef mandatory(String field) {
        fields.add(new ContractField(field, Text));
        return this;
    }

    public ContractDef optional(String field) {
        fields.add(new ContractField(field, Text, false));
        return this;
    }

    public ContractDef mandatory(String field, ContractType type) {
        fields.add(new ContractField(field, type));
        return this;
    }

    public ContractDef optional(String field, ContractType type) {
        fields.add(new ContractField(field, type, false));
        return this;
    }

    public ContractDef mandatory(String field, ContractType type, ContractCardinality cardinality) {
        fields.add(new ContractField(field, type, cardinality));
        return this;
    }

    public ContractDef optional(String field, ContractType type, ContractCardinality cardinality) {
        fields.add(new ContractField(field, type, cardinality, false));
        return this;
    }

    public List<ContractField> getFields() {
        return fields;
    }
}
