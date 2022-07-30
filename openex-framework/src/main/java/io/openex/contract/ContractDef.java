package io.openex.contract;

import io.openex.contract.fields.ContractElement;
import io.openex.contract.fields.ContractText;

import java.util.ArrayList;
import java.util.List;

public class ContractDef {

    private final List<ContractElement> fields = new ArrayList<>();

    private ContractDef() {
        //private constructor
    }

    public ContractDef addFields(List<ContractElement> fields) {
        this.fields.addAll(fields);
        return this;
    }

    public static ContractDef contractBuilder() {
        return new ContractDef();
    }

    public ContractDef mandatory(ContractElement element) {
        fields.add(element);
        return this;
    }

    public ContractDef mandatory(String key, String label) {
        fields.add(new ContractText(key, label));
        return this;
    }

    public ContractDef optional(ContractElement element) {
        element.setMandatory(false);
        fields.add(element);
        return this;
    }

    public List<ContractElement> build() {
        return fields;
    }
}
