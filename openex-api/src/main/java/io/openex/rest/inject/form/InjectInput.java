package io.openex.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import io.openex.database.model.Inject;

import java.util.ArrayList;
import java.util.List;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXISTING_PROPERTY, property = "inject_type")
public abstract class InjectInput<T> {

    @JsonProperty("inject_title")
    private String title;

    @JsonProperty("inject_description")
    private String description;

    @JsonProperty("inject_type")
    private String type;

    @JsonProperty("inject_depends_from_another")
    private String dependsOn;

    @JsonProperty("inject_depends_duration")
    private Long dependsDuration;

    @JsonProperty("inject_audiences")
    private List<String> audiences = new ArrayList<>();

    @JsonProperty("inject_all_audiences")
    private boolean allAudiences = false;

    @JsonProperty("inject_content")
    private T content;

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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<String> getAudiences() {
        return audiences;
    }

    public void setAudiences(List<String> audiences) {
        this.audiences = audiences;
    }

    public T getContent() {
        return content;
    }

    public void setContent(T content) {
        this.content = content;
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

    public String getDependsOn() {
        return dependsOn;
    }

    public void setDependsOn(String dependsOn) {
        this.dependsOn = dependsOn;
    }

    public Long getDependsDuration() {
        return dependsDuration;
    }

    public void setDependsDuration(Long dependsDuration) {
        this.dependsDuration = dependsDuration;
    }

    public abstract Inject<T> injectInstance();

    public Inject<T> toInject() {
        Inject<T> inject = injectInstance();
        inject.setTitle(getTitle());
        inject.setDescription(getDescription());
        inject.setDependsDuration(getDependsDuration());
        inject.setType(getType());
        inject.setContent(getContent());
        inject.setAllAudiences(getAllAudiences());
        return inject;
    }
}
