package io.openex.contract;

import io.openex.helper.SupportedLanguage;

import java.util.Map;

public class ContractConfig {
    private final String type;
    private final boolean expose;
    private final Map<SupportedLanguage, String> label;
    private final String color;
    private final String icon;

    public ContractConfig(String type, Map<SupportedLanguage, String> label, String color, String icon, boolean expose) {
        this.type = type;
        this.expose = expose;
        this.color = color;
        this.icon = icon;
        this.label = label;
    }

    public String getType() {
        return type;
    }

    public boolean isExpose() {
        return expose;
    }

    public String getColor() {
        return color;
    }

    public String getIcon() {
        return icon;
    }

    public Map<SupportedLanguage, String> getLabel() {
        return label;
    }
}
