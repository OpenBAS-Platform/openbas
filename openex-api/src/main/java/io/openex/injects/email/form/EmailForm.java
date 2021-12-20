package io.openex.injects.email.form;

import io.openex.database.model.Inject;
import io.openex.injects.email.model.EmailContent;
import io.openex.injects.email.model.EmailInject;
import io.openex.rest.inject.form.InjectInput;

public class EmailForm extends InjectInput<EmailContent> {

    @Override
    public Inject<EmailContent> injectInstance() {
        return new EmailInject();
    }
}
