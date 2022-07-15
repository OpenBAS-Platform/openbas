package io.openex.contract.fields;

import io.openex.contract.ContractType;

public class ContractTextArea extends ContractElement {

    private String defaultValue = "";
    private final boolean richText;

    public ContractTextArea(String key, String label, boolean richText) {
        super(key, label);
        this.richText = richText;
    }

    public static ContractTextArea textareaField(String key, String label) {
        return new ContractTextArea(key, label, false);
    }

    public static ContractTextArea richTextareaField(String key, String label) {
        return new ContractTextArea(key, label, true);
    }

    public static ContractTextArea richTextareaField(String key, String label, String defaultValue) {
        ContractTextArea contractText = new ContractTextArea(key, label, true);
        contractText.setDefaultValue(defaultValue);
        return contractText;
    }

    @Override
    public ContractType getType() {
        return ContractType.Textarea;
    }

    public boolean isRichText() {
        return richText;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }
}
