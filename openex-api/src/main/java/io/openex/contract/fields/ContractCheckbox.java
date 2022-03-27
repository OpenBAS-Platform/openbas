package io.openex.contract.fields;

import io.openex.contract.ContractType;

public class ContractCheckbox extends ContractElement {

    private boolean defaultValue = false;

    public ContractCheckbox(String key, String label) {
        super(key, label);
    }

    public static ContractCheckbox checkboxField(String key, String label, boolean checked) {
        ContractCheckbox contractCheckbox = new ContractCheckbox(key, label);
        contractCheckbox.setDefaultValue(checked);
        return contractCheckbox;
    }

    @Override
    public ContractType getType() {
        return ContractType.Checkbox;
    }

    public boolean isDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(boolean defaultValue) {
        this.defaultValue = defaultValue;
    }
}
