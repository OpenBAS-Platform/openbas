package io.openex.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.contract.fields.ContractElement;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ContractInstance {

    @JsonProperty("contract_id")
    private String id;

    private String name;

    private final boolean expose;

    private final String type;

    private List<ContractElement> fields;

    private final Map<String, String> context = new HashMap<>();

    public ContractInstance(String type, boolean expose, String id, String name, List<ContractElement> fields) {
        this.type = type;
        this.expose = expose;
        this.id = id;
        this.name = name;
        this.fields = fields;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public boolean isExpose() {
        return expose;
    }

    public Map<String, String> getContext() {
        return context;
    }

    public void addContext(String key, String value) {
        this.context.put(key, value);
    }
}
