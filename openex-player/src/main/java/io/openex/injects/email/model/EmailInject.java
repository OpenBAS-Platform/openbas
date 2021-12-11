package io.openex.injects.email.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.DryInject;
import io.openex.database.model.Dryrun;
import io.openex.injects.email.EmailExecutor;
import io.openex.database.model.Inject;
import io.openex.injects.email.converter.EmailContentConverter;
import io.openex.model.Executor;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import java.util.Date;

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

    @Override
    public DryInject<EmailContent> toDryInject(Dryrun run, Date from, int speed) {
        EmailDryInject dryInject = new EmailDryInject();
        dryInject.setTitle(getTitle());
        dryInject.setType(getType());
        dryInject.setContent(getContent());
        dryInject.setRun(run);
        dryInject.setDate(accelerateDate(from, speed));
        return dryInject;
    }
}
