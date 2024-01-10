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

    public static ContractDef contractBuilder() {
        return new ContractDef();
    }

    public ContractDef addFields(List<ContractElement> fields) {
        this.fields.addAll(fields);
        return this;
    }

    public ContractDef mandatory(ContractElement element) {
        this.fields.add(element);
        return this;
    }

    public ContractDef optional(ContractElement element) {
        element.setMandatory(false);
        this.fields.add(element);
        return this;
    }

    public List<ContractElement> build() {
        return this.fields;
    }
}
