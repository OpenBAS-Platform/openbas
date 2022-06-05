package io.openex.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.contract.fields.ContractElement;
import io.openex.helper.SupportedLanguage;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Contract {

    private final ContractConfig config;

    @JsonProperty("contract_id")
    private String id;

    private Map<SupportedLanguage, String> label;

    private final boolean manual;

    private List<ContractElement> fields;

    private final Map<String, String> context = new HashMap<>();

    private Contract(ContractConfig config, String id, Map<SupportedLanguage, String> label, boolean manual, List<ContractElement> fields) {
        this.config = config;
        this.id = id;
        this.label = label;
        this.manual = manual;
        this.fields = fields;
    }

    public static Contract manualContract(ContractConfig config, String id, Map<SupportedLanguage, String> label, List<ContractElement> fields) {
        return new Contract(config, id, label, true, fields);
    }

    public static Contract executableContract(ContractConfig config, String id, Map<SupportedLanguage, String> label, List<ContractElement> fields) {
        return new Contract(config, id, label, false, fields);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<ContractElement> getFields() {
        return fields;
    }

    public void setFields(List<ContractElement> fields) {
        this.fields = fields;
    }

    public Map<SupportedLanguage, String> getLabel() {
        return label;
    }

    public void setLabel(Map<SupportedLanguage, String> label) {
        this.label = label;
    }

    public boolean isManual() {
        return manual;
    }

    public Map<String, String> getContext() {
        return context;
    }

    public void addContext(String key, String value) {
        this.context.put(key, value);
    }

    public ContractConfig getConfig() {
        return config;
    }
}
