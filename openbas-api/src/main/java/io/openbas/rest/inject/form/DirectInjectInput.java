package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectorContract;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

public class DirectInjectInput {

    @JsonProperty("inject_title")
    private String title;

    @JsonProperty("inject_description")
    private String description;

    @JsonProperty("inject_injector_contract")
    private String injectorContract;

    @JsonProperty("inject_content")
    private ObjectNode content;

    @JsonProperty("inject_users")
    private List<String> userIds = new ArrayList<>();

    @JsonProperty("inject_documents")
    private List<InjectDocumentInput> documents = new ArrayList<>();

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getInjectorContract() {
        return injectorContract;
    }

    public void setInjectorContract(String injectorContract) {
        this.injectorContract = injectorContract;
    }

    public ObjectNode getContent() {
        return content;
    }

    public void setContent(ObjectNode content) {
        this.content = content;
    }

    public List<String> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<String> userIds) {
        this.userIds = userIds;
    }

    public List<InjectDocumentInput> getDocuments() {
        return documents;
    }

    public void setDocuments(List<InjectDocumentInput> documents) {
        this.documents = documents;
    }

    public Inject toInject(@NotNull final InjectorContract injectorContract) {
        Inject inject = new Inject();
        inject.setTitle(getTitle());
        inject.setDescription(getDescription());
        inject.setContent(getContent());
        inject.setInjectorContract(injectorContract);
        return inject;
    }
}
