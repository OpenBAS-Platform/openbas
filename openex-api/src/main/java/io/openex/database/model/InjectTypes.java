package io.openex.database.model;

import io.openex.contract.ContractField;

import java.util.List;

public class InjectTypes {

    private String type;

    private List<ContractField> fields;

    public InjectTypes(String type, List<ContractField> fields) {
        this.type = type;
        this.fields = fields;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<ContractField> getFields() {
        return fields;
    }

    public void setFields(List<ContractField> fields) {
        this.fields = fields;
    }
}
