package io.openex.injects.email.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Inject;
import io.openex.rest.inject.form.InjectInput;

public class EmailForm extends InjectInput {

    @JsonProperty("inject_content")
    private EmailContent content;

    public EmailContent getContent() {
        return content;
    }

    public void setContent(EmailContent content) {
        this.content = content;
    }

    @Override
    public Inject init() {
        EmailInject emailInject = new EmailInject();
        emailInject.setContent(content);
        return emailInject;
    }
}
