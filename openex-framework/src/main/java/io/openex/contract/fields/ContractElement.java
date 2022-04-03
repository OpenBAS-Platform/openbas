package io.openex.contract.fields;

import io.openex.contract.ContractType;

public abstract class ContractElement {

    private String key;

    private String label;

    private boolean mandatory = true;

    public ContractElement(String key, String label) {
        this.key = key;
        this.label = label;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public boolean isMandatory() {
        return mandatory;
    }

    public void setMandatory(boolean mandatory) {
        this.mandatory = mandatory;
    }

    protected abstract ContractType getType();
}
