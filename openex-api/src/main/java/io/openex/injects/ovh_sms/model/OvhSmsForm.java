package io.openex.injects.ovh_sms.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Inject;
import io.openex.rest.inject.form.InjectInput;

public class OvhSmsForm extends InjectInput {

    @JsonProperty("inject_content")
    private OvhSmsContent content;

    public OvhSmsContent getContent() {
        return content;
    }

    public void setContent(OvhSmsContent content) {
        this.content = content;
    }

    @Override
    public Inject init() {
        OvhSmsInject manualInject = new OvhSmsInject();
        manualInject.setContent(content);
        return manualInject;
    }
}
