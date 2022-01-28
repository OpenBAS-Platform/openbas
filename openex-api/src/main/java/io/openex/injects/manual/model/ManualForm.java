package io.openex.injects.manual.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Inject;
import io.openex.rest.inject.form.InjectInput;

public class ManualForm extends InjectInput {

    @JsonProperty("inject_content")
    private ManualContent content;

    public ManualContent getContent() {
        return content;
    }

    public void setContent(ManualContent content) {
        this.content = content;
    }

    @Override
    public Inject init() {
        ManualInject manualInject = new ManualInject();
        manualInject.setContent(content);
        return manualInject;
    }
}
