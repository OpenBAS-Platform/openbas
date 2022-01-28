package io.openex.contract;

import java.util.ArrayList;
import java.util.List;

import static io.openex.contract.ContractType.Text;

public class ContractDef {

    private final List<ContractField> fields = new ArrayList<>();

    private ContractDef() {
        //private constructor
    }

    public static ContractDef build() {
        return new ContractDef();
    }

    public ContractDef mandatory(String field) {
        fields.add(new ContractField(field, Text, true));
        return this;
    }

    public ContractDef mandatory(String field, ContractType type) {
        fields.add(new ContractField(field, type, true));
        return this;
    }

    public ContractDef mandatory(String field, ContractType type, ContractCardinality cardinality) {
        fields.add(new ContractField(field, type, cardinality, true));
        return this;
    }

    public ContractDef optional(String field, ContractType type) {
        fields.add(new ContractField(field, type, false));
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
