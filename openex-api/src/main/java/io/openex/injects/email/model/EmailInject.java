package io.openex.injects.email.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.DryInject;
import io.openex.database.model.Inject;
import io.openex.injects.email.EmailExecutor;
import io.openex.injects.email.converter.EmailContentConverter;
import io.openex.model.Executor;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("openex_email")
public class EmailInject extends Inject<EmailContent> {

    @Column(name = "inject_content")
    @Convert(converter = EmailContentConverter.class)
    @JsonProperty("inject_content")
    private EmailContent content;

    @Override
    public EmailContent getContent() {
        return content;
    }

    @Override
    public void setContent(EmailContent content) {
        this.content = content;
    }

    @Override
    public Class<? extends Executor<EmailContent>> executor() {
        return EmailExecutor.class;
    }

    @Override
    public DryInject<EmailContent> toDry() {
        return new EmailDryInject();
    }
}
