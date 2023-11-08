package io.openex.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openex.database.model.Inject;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

public class InjectInput {

    @JsonProperty("inject_title")
    private String title;

    @JsonProperty("inject_description")
    private String description;

    @JsonProperty("inject_contract")
    private String contract;

    @JsonProperty("inject_content")
    private ObjectNode content;

    @JsonProperty("inject_depends_from_another")
    private String dependsOn;

    @Getter
    @Setter
    @JsonProperty("inject_depends_duration")
    private Long dependsDuration;

    @JsonProperty("inject_audiences")
    private List<String> audiences = new ArrayList<>();

    @JsonProperty("inject_documents")
    private List<InjectDocumentInput> documents = new ArrayList<>();

    @JsonProperty("inject_all_audiences")
    private boolean allAudiences = false;

    @JsonProperty("inject_country")
    private String country;

    @JsonProperty("inject_city")
    private String city;

    @JsonProperty("inject_tags")
    private List<String> tagIds = new ArrayList<>();;

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

    public ObjectNode getContent() {
        return content;
    }

    public void setContent(ObjectNode content) {
        this.content = content;
    }

    public String getContract() {
        return contract;
    }

    public void setContract(String contract) {
        this.contract = contract;
    }

    public List<String> getAudiences() {
        return audiences;
    }

    public void setAudiences(List<String> audiences) {
        this.audiences = audiences;
    }

    public boolean getAllAudiences() {
        return allAudiences;
    }

    public void setAllAudiences(boolean allAudiences) {
        this.allAudiences = allAudiences;
    }

    public boolean isAllAudiences() {
        return allAudiences;
    }

    public List<InjectDocumentInput> getDocuments() {
        return documents;
    }

    public void setDocuments(List<InjectDocumentInput> documents) {
        this.documents = documents;
    }

    public String getDependsOn() {
        return dependsOn;
    }

    public void setDependsOn(String dependsOn) {
        this.dependsOn = dependsOn;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public List<String> getTagIds() {
        return tagIds;
    }

    public void setTagIds(List<String> tagIds) {
        this.tagIds = tagIds;
    }

    public Inject toInject() {
        Inject inject = new Inject();
        inject.setTitle(getTitle());
        inject.setDescription(getDescription());
        inject.setContent(getContent());
        inject.setContract(getContract());
        inject.setDependsDuration(getDependsDuration());
        inject.setAllAudiences(getAllAudiences());
        inject.setCountry(getCountry());
        inject.setCity(getCity());
        return inject;
    }
}
