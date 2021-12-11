package io.openex.injects.email.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.injects.email.EmailExecutor;
import io.openex.database.model.DryInject;
import io.openex.injects.email.converter.EmailContentConverter;
import io.openex.model.Executor;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("openex_email")
public class EmailDryInject extends DryInject<EmailContent> {

    @Column(name = "dryinject_content")
    @Convert(converter = EmailContentConverter.class)
    @JsonProperty("dryinject_content")
    private EmailContent content;

    public EmailContent getContent() {
        return content;
    }

    public void setContent(EmailContent content) {
        this.content = content;
    }

    @Override
    public Class<? extends Executor<?>> executor() {
        return EmailExecutor.class;
    }
}
