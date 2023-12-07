package io.openex.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openex.database.model.Inject;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
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
    private List<String> tagIds = new ArrayList<>();

    public boolean getAllAudiences() {
        return allAudiences;
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
