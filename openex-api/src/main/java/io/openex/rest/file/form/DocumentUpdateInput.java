package io.openex.rest.file.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DocumentUpdateInput {

    @JsonProperty("document_name")
    private String name;

    @JsonProperty("document_description")
    private String description;

    @JsonProperty("document_type")
    private String type;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
