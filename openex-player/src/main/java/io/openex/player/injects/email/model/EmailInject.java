package io.openex.player.injects.email.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.player.injects.email.EmailExecutor;
import io.openex.player.model.database.Inject;
import io.openex.player.model.Executor;

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
