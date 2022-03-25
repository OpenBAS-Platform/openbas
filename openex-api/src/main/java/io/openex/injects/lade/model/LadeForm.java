package io.openex.injects.lade.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Inject;
import io.openex.injects.lade.model.LadeContent;
import io.openex.injects.lade.model.LadeInject;
import io.openex.rest.inject.form.InjectInput;

public class LadeForm extends InjectInput {

    @JsonProperty("inject_content")
    private LadeContent content;

    public LadeContent getContent() {
        return content;
    }

    public void setContent(LadeContent content) {
        this.content = content;
    }

    @Override
    public Inject init() {
        LadeInject ladeInject = new LadeInject();
        ladeInject.setContent(content);
        return ladeInject;
    }
}
